"""Static preview server with caching disabled. Usage: python tools/serve.py [port]"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 5317
print(f'Serving on http://127.0.0.1:{port}')
ThreadingHTTPServer(('127.0.0.1', port), NoCache).serve_forever()
