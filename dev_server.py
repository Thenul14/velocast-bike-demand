"""Local API server; Vite proxies /api to port 8000."""
from http.server import ThreadingHTTPServer
from api.predict import handler

if __name__ == '__main__':
    print('Local prediction API: http://127.0.0.1:8000/api/predict', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8000), handler).serve_forever()
