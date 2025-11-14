# 启动后端服务的PowerShell脚本
Write-Host "正在启动SilentSign后端服务..." -ForegroundColor Green

try {
    # 切换到后端目录
    Set-Location -Path "backend" -ErrorAction Stop
    
    # 启动Python应用
    $backendProcess = Start-Process -FilePath "python" -ArgumentList "app.py" -NoNewWindow -PassThru
    
    # 等待3秒确保服务启动
    Start-Sleep -Seconds 3
    
    Write-Host "后端服务已启动" -ForegroundColor Green
    Write-Host "访问地址: http://localhost:5000" -ForegroundColor Green
    
    # 保持窗口打开
    Read-Host "按回车键退出..."
    
    # 停止后台进程（可选）
    if ($backendProcess) {
        Stop-Process -Id $backendProcess.Id -Force
    }
}
catch {
    Write-Host "启动后端服务时出错: $_" -ForegroundColor Red
    Read-Host "按回车键退出..."
}