"""Local static preview with a persistent, per-browser-session visit counter."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from http.cookies import SimpleCookie
from pathlib import Path
import base64
import binascii
import re
import struct
import argparse
import json
import secrets
import sqlite3

ROOT = Path(__file__).resolve().parent

class Preview(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def json_response(self, value, status=200):
        body = json.dumps(value).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == '/api/wall':
            with sqlite3.connect(self.server.database) as db:
                rows = db.execute('SELECT id,title,name,created_at FROM wall_posts ORDER BY rowid DESC LIMIT 100').fetchall()
            self.json_response({'posts': [dict(id=r[0], title=r[1], name=r[2], created_at=r[3], image='/api/wall/image/'+r[0]) for r in rows]})
            return
        match = re.fullmatch(r'/api/wall/image/([a-f0-9]{32})', self.path)
        if match:
            with sqlite3.connect(self.server.database) as db:
                row = db.execute('SELECT image FROM wall_posts WHERE id=?', (match[1],)).fetchone()
            if not row:
                self.send_error(404)
                return
            self.send_response(200)
            self.send_header('Content-Type', 'image/png')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Content-Length', str(len(row[0])))
            self.end_headers()
            self.wfile.write(row[0])
            return
        super().do_GET()

    def post_wall(self):
        origin = self.headers.get('Origin')
        if origin and origin != 'http://' + self.headers.get('Host', ''):
            self.json_response({'error':'Invalid origin'},403)
            return
        try:
            size = int(self.headers.get('Content-Length','0'))
            if not 0 < size <= 3000000:
                self.json_response({'error':'Drawing is too large.'},413)
                return
            data = json.loads(self.rfile.read(size))
            title = str(data.get('title','Untitled masterpiece')).strip()[:80] or 'Untitled masterpiece'
            name = str(data.get('name','Anonymous')).strip()[:40] or 'Anonymous'
            request_id = data.get('request_id','')
            if not isinstance(request_id,str) or not re.fullmatch(r'[a-zA-Z0-9-]{16,80}',request_id):
                raise ValueError()
            encoded = data.get('image','')
            if not isinstance(encoded,str) or not encoded.startswith('data:image/png;base64,'):
                raise ValueError()
            png = base64.b64decode(encoded.split(',',1)[1],validate=True)
            if len(png)<33 or png[:8]!=b'\x89PNG\r\n\x1a\n' or png[12:16]!=b'IHDR':
                raise ValueError()
            w,h = struct.unpack('>II',png[16:24])
            if not 1<=w<=2048 or not 1<=h<=2048:
                raise ValueError()
        except (ValueError,TypeError,AttributeError,binascii.Error):
            self.json_response({'error':'Please post a valid Paint drawing.'},400)
            return
        with sqlite3.connect(self.server.database,timeout=10) as db:
            post_id = secrets.token_hex(16)
            db.execute('INSERT OR IGNORE INTO wall_posts(id,request_id,title,name,image) VALUES(?,?,?,?,?)',(post_id,request_id,title,name,png))
            post_id = db.execute('SELECT id FROM wall_posts WHERE request_id=?',(request_id,)).fetchone()[0]
        self.json_response({'id':post_id},201)

    def do_POST(self):
        if self.path == '/api/wall':
            self.post_wall()
            return
        if self.path != '/api/visits':
            self.send_error(404)
            return
        origin = self.headers.get('Origin')
        if origin and origin != 'http://' + self.headers.get('Host', ''):
            self.send_error(403)
            return
        cookies = SimpleCookie()
        try:
            cookies.load(self.headers.get('Cookie', ''))
        except Exception:
            pass
        token = cookies['nico_visit'].value if 'nico_visit' in cookies else ''
        with sqlite3.connect(self.server.database, timeout=10) as db:
            exists = db.execute('SELECT 1 FROM visits WHERE token = ?', (token,)).fetchone()
            if not exists:
                token = secrets.token_urlsafe(24)
                db.execute('INSERT INTO visits(token) VALUES (?)', (token,))
            count = db.execute('SELECT COUNT(*) FROM visits').fetchone()[0]
        body = json.dumps({'count': count}).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Set-Cookie', f'nico_visit={token}; Path=/; HttpOnly; SameSite=Lax')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--database', type=Path, required=True)
    args = parser.parse_args()
    args.database.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(args.database) as db:
        db.execute('CREATE TABLE IF NOT EXISTS visits (token TEXT PRIMARY KEY, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
        db.execute('CREATE TABLE IF NOT EXISTS wall_posts (id TEXT PRIMARY KEY, request_id TEXT UNIQUE NOT NULL, title TEXT NOT NULL, name TEXT NOT NULL, image BLOB NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Preview)
    server.database = str(args.database)
    print(f'Local preview: http://127.0.0.1:{args.port}', flush=True)
    server.serve_forever()
