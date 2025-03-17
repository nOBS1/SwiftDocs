# 检查 Node.js 依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
}

# 检查环境变量文件
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "Please configure your .env.local file with appropriate API keys." -ForegroundColor Red
}

# 启动开发服务器
Write-Host "Starting frontend development server..." -ForegroundColor Green
npm run dev 