// 简单的本地开发服务器
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// 支持的文件扩展名
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // 处理根路径
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // 确保路径安全
  filePath = path.join('./', filePath);
  
  // 解析文件扩展名
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // 读取文件
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // 文件不存在
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found', 'utf8');
      } else {
        // 其他错误
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error', 'utf8');
      }
    } else {
      // 成功读取文件
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('请在浏览器中打开该地址访问SilentSign项目');
});