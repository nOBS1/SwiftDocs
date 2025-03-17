# 检查 Python 虚拟环境
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# 激活虚拟环境
.\venv\Scripts\Activate.ps1

# 检查并安装依赖
if (-not (Test-Path "venv\Lib\site-packages\fastapi")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# 检查 Redis 服务
$redis = Get-Process -Name "redis-server" -ErrorAction SilentlyContinue
if (-not $redis) {
    Write-Host "Starting Redis server..." -ForegroundColor Yellow
    Start-Process "redis-server"
}

# 启动后端服务
Write-Host "Starting backend server..." -ForegroundColor Green
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 