const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.webp': 'image/webp',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.txt':  'text/plain',
    '.xml':  'application/xml',
};

http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];

    // Map clean URLs → .html files
    if (!path.extname(urlPath)) {
        urlPath = urlPath === '/' ? '/index.html' : urlPath + '.html';
    }

    const filePath = path.join(ROOT, urlPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(fs.readFileSync(filePath));
    } else {
        const notFound = path.join(ROOT, '404.html');
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : '404 Not Found');
    }
}).listen(PORT, () => {
    console.log('Dev server: http://localhost:' + PORT);
});
