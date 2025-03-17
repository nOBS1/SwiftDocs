# SwiftDocs 跨平台启动脚本 (Windows PowerShell)

# 颜色定义
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue
$White = [System.ConsoleColor]::White

# 检测操作系统
$OS = [System.Environment]::OSVersion.Platform
Write-Host "检测到操作系统: Windows $([System.Environment]::OSVersion.Version)" -ForegroundColor $Blue

# 显示菜单
function Show-Menu {
    Write-Host "===== SwiftDocs 启动选项 =====" -ForegroundColor $Green
    Write-Host "1) 启动后端服务" -ForegroundColor $Yellow
    Write-Host "2) 启动前端服务" -ForegroundColor $Yellow
    Write-Host "3) 启动全栈应用 (Docker)" -ForegroundColor $Yellow
    Write-Host "4) 安装依赖" -ForegroundColor $Yellow
    Write-Host "5) 退出" -ForegroundColor $Yellow
    Write-Host "===========================" -ForegroundColor $Green
}

# 启动后端
function Start-Backend {
    Write-Host "启动后端服务..." -ForegroundColor $Blue
    Set-Location -Path "SwiftDocs-Backend"
    python run.py
    Set-Location -Path ".."
}

# 启动前端
function Start-Frontend {
    Write-Host "启动前端服务..." -ForegroundColor $Blue
    Set-Location -Path "SwiftDocs-Frontend"
    node run.js
    Set-Location -Path ".."
}

# 启动Docker
function Start-DockerApp {
    Write-Host "使用Docker启动全栈应用..." -ForegroundColor $Blue
    
    # 检查Docker是否安装
    if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
        Write-Host "错误: Docker未安装" -ForegroundColor $Red
        Write-Host "请先安装Docker Desktop for Windows" -ForegroundColor $Yellow
        return
    }
    
    # 检查Docker Compose是否安装
    if (-not (Get-Command "docker-compose" -ErrorAction SilentlyContinue)) {
        Write-Host "错误: Docker Compose未安装" -ForegroundColor $Red
        Write-Host "请先安装Docker Compose" -ForegroundColor $Yellow
        return
    }
    
    # 启动Docker Compose
    docker-compose up -d
    
    Write-Host "应用已启动:" -ForegroundColor $Green
    Write-Host "前端: http://localhost:3000" -ForegroundColor $Blue
    Write-Host "后端API: http://localhost:8000/api/v1" -ForegroundColor $Blue
    Write-Host "API文档: http://localhost:8000/api/v1/docs" -ForegroundColor $Blue
}

# 安装依赖
function Install-Dependencies {
    Write-Host "安装系统依赖..." -ForegroundColor $Blue
    
    # 检查Chocolatey
    if (-not (Get-Command "choco" -ErrorAction SilentlyContinue)) {
        Write-Host "Chocolatey未安装，是否安装? (Y/N)" -ForegroundColor $Yellow
        $choice = Read-Host
        if ($choice -eq "Y" -or $choice -eq "y") {
            Write-Host "安装Chocolatey..." -ForegroundColor $Blue
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        } else {
            Write-Host "请手动安装Chocolatey后再试" -ForegroundColor $Red
            return
        }
    }
    
    # 安装Tesseract OCR
    Write-Host "安装Tesseract OCR..." -ForegroundColor $Blue
    choco install tesseract -y
    
    # 安装Redis
    Write-Host "安装Redis..." -ForegroundColor $Blue
    choco install redis-64 -y
    
    # 启动Redis服务
    Write-Host "启动Redis服务..." -ForegroundColor $Blue
    Start-Process "redis-server" -WindowStyle Hidden
    
    Write-Host "系统依赖安装完成" -ForegroundColor $Green
}

# 主函数
function Main {
    while ($true) {
        Show-Menu
        $choice = Read-Host "请选择操作 [1-5]"
        
        switch ($choice) {
            "1" { Start-Backend }
            "2" { Start-Frontend }
            "3" { Start-DockerApp }
            "4" { Install-Dependencies }
            "5" { Write-Host "再见!" -ForegroundColor $Green; exit }
            default { Write-Host "无效选择，请重试" -ForegroundColor $Red }
        }
        
        Write-Host ""
    }
}

# 执行主函数
Main 