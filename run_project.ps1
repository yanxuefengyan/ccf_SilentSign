# SilentSign 项目启动脚本
# 用于在PowerShell中直接运行

Write-Host "=========================================" -ForegroundColor Green
Write-Host "     SilentSign 项目启动脚本" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

try {
    # 检查Python是否安装
    Write-Host "检查Python环境..." -ForegroundColor Yellow
    $pythonVersion = python --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 未找到Python，请先安装Python" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
    
    # 安装必要的Python包
    Write-Host "安装必要依赖..." -ForegroundColor Yellow
    pip install flask flask-cors requests
    
    # 启动后端服务
    Write-Host "启动后端服务 (端口 5000)..." -ForegroundColor Green
    Start-Process -FilePath "python" -ArgumentList "backend/app.py" -WorkingDirectory "backend" -PassThru
    
    # 等待后端启动
    Start-Sleep -Seconds 3
    
    # 启动前端服务
    Write-Host "启动前端服务 (端口 3000)..." -ForegroundColor Green
    Start-Process -FilePath "python" -ArgumentList "-m", "http.server", "3000" -WorkingDirectory "frontend\web" -PassThru
    
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "项目已启动成功!" -ForegroundColor Green
    Write-Host "后端API: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "前端页面: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Green
    Read-Host "按回车键退出"
}
catch {
    Write-Host "启动过程中出现错误: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "按回车键退出"
}