// Usage: node tools/generate.mjs [id,id,...] [--concurrency N] [--force] [--manifest tools/manifest2.mjs]
// Runs one `codex exec` session per image, copies the PNG into <out>/<id>.png.
// An entry with `chain: [edit, edit, ...]` asks for an edit chain in ONE session (pixel-aligned
// variants) and saves <id>-0.png (the original) through <id>-N.png.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const manifestPath = path.resolve(ROOT, flag('--manifest') || 'tools/manifest.mjs');
const { images, styles, out = 'assets/raw' } = await import(pathToFileURL(manifestPath).href);

const RAW = path.join(ROOT, out);
const LOGS = path.join(ROOT, 'tools', 'logs');
const GEN = path.join(os.homedir(), '.codex', 'generated_images');
fs.mkdirSync(RAW, { recursive: true });
fs.mkdirSync(LOGS, { recursive: true });

const LIMIT = +(flag('--concurrency') || 16);
const force = args.includes('--force');
const valueIdx = new Set(['--concurrency', '--manifest'].map(f => args.indexOf(f)).filter(i => i >= 0).map(i => i + 1));
const only = args.filter((a, i) => !a.startsWith('--') && !valueIdx.has(i))[0];
const firstFile = im => path.join(RAW, im.chain ? `${im.id}-0.png` : `${im.id}.png`);
let queue = images.filter(im => !only || only.split(',').includes(im.id));
const skipped = queue.filter(im => !force && fs.existsSync(firstFile(im)));
queue = queue.filter(im => !skipped.includes(im));
skipped.forEach(im => console.log(`skip  ${im.id} (exists)`));

function promptFor(im) {
  const head = 'IMPORTANT: Do NOT run any shell commands. Do NOT read, write or copy any files. Your shell sandbox is broken.';
  if (!im.chain) {
    return [head,
      'Only call your built-in image generation tool (image_gen) exactly once, then reply with only the saved file path.', '',
      `Generate this image. Shape: ${im.shape}.`, im.prompt, styles[im.concept]].join('\n');
  }
  return [head,
    `Only use your built-in image generation tool (image_gen). Call it exactly ${im.chain.length + 1} times, one after another, then reply with only the saved file paths.`, '',
    `Step 1: generate this image. Shape: ${im.shape}.`, im.prompt, styles[im.concept], '',
    ...im.chain.map((e, i) => `Step ${i + 2}: edit the image from step 1 (not the previous step). Keep the exact same framing, camera, composition, lighting, background and every other pixel identical. Change ONLY this: ${e}`),
  ].join('\n');
}

function run(im) {
  return new Promise(resolve => {
    const t0 = Date.now();
    console.log(`start ${im.id}`);
    const p = spawn('codex exec --skip-git-repo-check --sandbox read-only -c model_reasoning_effort="low" --color never -', { shell: true });
    let out = '';
    p.stdout.on('data', d => (out += d));
    p.stderr.on('data', d => (out += d));
    p.stdin.end(promptFor(im));
    p.on('close', code => {
      fs.writeFileSync(path.join(LOGS, im.id + '.log'), out);
      const sid = (out.match(/session id:\s*([0-9a-f-]{36})/i) || [])[1];
      const dir = sid && path.join(GEN, sid);
      const pngs = dir && fs.existsSync(dir)
        ? fs.readdirSync(dir).filter(f => /\.png$/i.test(f)).map(f => path.join(dir, f))
            .sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs)
        : [];
      const secs = ((Date.now() - t0) / 1000).toFixed(0);
      if (im.chain && pngs.length) {
        pngs.forEach((p, i) => fs.copyFileSync(p, path.join(RAW, `${im.id}-${i}.png`)));
        const note = pngs.length === im.chain.length + 1 ? '' : `  (expected ${im.chain.length + 1})`;
        console.log(`ok    ${im.id.padEnd(14)} ${secs}s  ${pngs.length} images${note}  session ${sid}`);
        resolve(true);
      } else if (pngs.length) {
        fs.copyFileSync(pngs[pngs.length - 1], path.join(RAW, im.id + '.png'));
        console.log(`ok    ${im.id.padEnd(14)} ${secs}s  session ${sid}`);
        resolve(true);
      } else {
        console.log(`FAIL  ${im.id.padEnd(14)} ${secs}s  exit ${code} session ${sid || '?'} (tools/logs/${im.id}.log)`);
        resolve(false);
      }
    });
  });
}

console.log(`Generating ${queue.length} image(s), ${LIMIT} at a time...`);
let ok = 0, fail = 0, i = 0;
async function worker() {
  while (i < queue.length) {
    const im = queue[i++];
    (await run(im)) ? ok++ : fail++;
  }
}
await Promise.all(Array.from({ length: Math.min(LIMIT, queue.length) }, worker));
console.log(`Done: ${ok} ok, ${fail} failed.`);
