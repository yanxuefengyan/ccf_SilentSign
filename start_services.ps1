# SilentSign 项目启动脚本
# 用于在Windows PowerShell中启动所有服务

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     SilentSign 项目启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    # 启动后端服务
    Write-Host "1. 启动后端服务 (端口 5000)..." -ForegroundColor Yellow
    Set-Location backend
    python app.py
}
catch {
    Write-Host "启动后端服务失败: $_" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "启动完成！请在新窗口中查看后端服务" -ForegroundColor Green
Write-Host "前端访问地址: http://localhost:3000" -ForegroundColor Green
Write-Host "后端API地址: http://localhost:5000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan