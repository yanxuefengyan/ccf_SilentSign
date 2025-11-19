#!/usr/bin/env python3
"""
简单的HTTP服务器，用于本地开发测试
"""

import http.server
import socketserver
import webbrowser
import threading
import os

def start_server(port=3000):
    """启动HTTP服务器"""
    HOST = "localhost"
    try:
        # 设置工作目录
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # 创建服务器
        Handler = SilentSignHTTPRequestHandler
        with socketserver.TCPServer((HOST, port), Handler) as httpd:
            print(f"SilentSign 本地服务器已启动")
            print(f"访问地址: http://{HOST}:{port}")
            print(f"按 Ctrl+C 停止服务器")
            
            # 打开浏览器
            threading.Timer(1, lambda: webbrowser.open(f'http://{HOST}:{port}')).start()
            
            # 启动服务器
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 98:  # 端口已占用
            print(f"错误: 端口 {port} 已被占用")
            print("尝试使用其他端口...")
            start_server(8080)
        else:
            print(f"启动服务器时出错: {e}")

class SilentSignHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """自定义请求处理器"""
    def end_headers(self):
        # 添加CORS头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == "__main__":
    start_server()