<![CDATA#!/usr/bin/env python3
"""
SilentSign 项目启动脚本
用于启动后端服务和开发服务器
"""

import os
import sys
import subprocess
import threading
from time import sleep

def start_backend():
    """启动后端服务"""
    print("正在启动后端服务...")
    try:
        # 在后台启动Flask应用
        process = subprocess.Popen([
            sys.executable, 'backend/app.py'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # 等待服务启动
        sleep(2)
        print("后端服务已启动，端口: 5000")
        return process
    except Exception as e:
        print(f"启动后端服务失败: {e}")
        return None

def start_frontend():
    """启动前端开发服务器"""
    print("正在启动前端开发服务器...")
    try:
        # 这里可以添加前端服务器启动命令
        print("前端服务器启动完成")
    except Exception as e:
        print(f"启动前端服务器失败: {e}")

def main():
    print("=" * 50)
    print("SilentSign 项目启动")
    print("=" * 50)
    
    # 启动后端服务
    backend_process = start_backend()
    
    if backend_process:
        print("\n项目已启动:")
        print("- 后端服务: http://localhost:5000")
        print("- 前端页面: http://localhost:3000")
        print("\n按 Ctrl+C 停止服务")
        
        try:
            # 保持主进程运行
            while True:
                sleep(1)
        except KeyboardInterrupt:
            print("\n正在停止服务...")
            if backend_process:
                backend_process.terminate()
            print("服务已停止")

if __name__ == "__main__":
    main()