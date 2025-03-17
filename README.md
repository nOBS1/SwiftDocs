# SwiftDocs - 智能文档处理系统

SwiftDocs 是一个现代化的文档处理应用，提供 PDF 文档处理、OCR 识别、翻译等功能。项目采用前后端分离架构，提供高性能和可扩展的解决方案。

## 项目架构

```
E:/A/
├── SwiftDocs-Frontend/    # 前端项目 (Next.js)
│   ├── src/              # 源代码
│   ├── public/           # 静态资源
│   └── ...
│
└── SwiftDocs-Backend/    # 后端项目 (FastAPI)
    ├── app/             # 应用代码
    │   ├── main.py     # 主入口
    │   ├── core/       # 核心模块
    │   ├── api/        # API路由
    │   └── services/   # 业务服务
    └── ...
```

## 技术栈

### 前端 (SwiftDocs-Frontend)

- **框架**: Next.js 14
- **语言**: TypeScript
- **UI组件**: shadcn/ui
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **主要依赖**:
  - React 18
  - PDF.js (PDF处理)
  - Framer Motion (动画)
  - React-dropzone (文件上传)

### 后端 (SwiftDocs-Backend)

- **框架**: FastAPI
- **语言**: Python 3.9+
- **主要依赖**:
  - Uvicorn (ASGI服务器)
  - Pydantic (数据验证)
  - PyMuPDF (PDF处理)
  - OpenCV (图像处理)
  - Tesseract (OCR识别)
  - Celery (异步任务)

## 环境要求

### 前端要求
- Node.js 16.0.0+
- npm 或 yarn

### 后端要求
- Python 3.9+
- pip
- Tesseract-OCR
- Redis (用于Celery)

## 跨平台快速开始

SwiftDocs 支持 Windows、macOS 和 Linux 平台。我们提供了跨平台启动脚本，简化了环境配置和启动过程。

### 1. 克隆项目

```bash
git clone <repository-url>
```

### 2. 后端设置 (SwiftDocs-Backend)

使用跨平台启动脚本：

```bash
# Linux/macOS
cd SwiftDocs-Backend
python run.py

# Windows
cd SwiftDocs-Backend
python run.py
```

启动脚本会自动：
- 创建 Python 虚拟环境
- 安装所需依赖
- 配置环境变量
- 启动后端服务

高级选项：
```bash
# 仅设置环境不启动服务
python run.py --setup

# 指定主机和端口
python run.py --host 127.0.0.1 --port 8080

# 禁用自动重载
python run.py --no-reload
```

### 3. 前端设置 (SwiftDocs-Frontend)

使用跨平台启动脚本：

```bash
# Linux/macOS
cd SwiftDocs-Frontend
node run.js

# Windows
cd SwiftDocs-Frontend
node run.js
```

启动脚本会自动：
- 检查 Node.js 版本
- 安装依赖
- 创建和配置环境变量
- 启动开发服务器

## 平台特定配置

### Windows

#### Tesseract-OCR 安装
```powershell
# 使用 Chocolatey
choco install tesseract

# 或手动下载安装
# 从 https://github.com/UB-Mannheim/tesseract/wiki 下载
```

#### Redis 安装
```powershell
# 使用 Chocolatey
choco install redis-64

# 启动 Redis 服务
redis-server
```

### macOS

#### Tesseract-OCR 安装
```bash
# 使用 Homebrew
brew install tesseract
```

#### Redis 安装
```bash
# 使用 Homebrew
brew install redis

# 启动 Redis 服务
brew services start redis
```

### Linux (Ubuntu/Debian)

#### Tesseract-OCR 安装
```bash
sudo apt update
sudo apt install tesseract-ocr
sudo apt install libtesseract-dev
```

#### Redis 安装
```bash
sudo apt update
sudo apt install redis-server

# 启动 Redis 服务
sudo systemctl start redis
```

## 访问应用

- 前端: http://localhost:3000
- 后端 API: http://localhost:8000/api/v1
- API 文档: http://localhost:8000/api/v1/docs

## 配置说明

### 前端环境变量 (.env.local)
```env
# API配置
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# API密钥配置
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
BAIDU_APP_ID=your_baidu_app_id
BAIDU_APP_KEY=your_baidu_app_key
GOOGLE_API_KEY=your_google_api_key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 后端环境变量 (.env)
```env
# API配置
HOST=0.0.0.0
PORT=8000
API_V1_STR=/api/v1
PROJECT_NAME=SwiftDocs API

# CORS配置
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# API密钥配置
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
BAIDU_APP_ID=your_baidu_app_id
BAIDU_APP_KEY=your_baidu_app_key
```

## 主要功能

1. **文档处理**
   - PDF文件上传和预览
   - OCR文字识别
   - 文档格式转换

2. **翻译功能**
   - 多语言翻译支持
   - 实时翻译
   - 批量翻译

3. **用户界面**
   - 响应式设计
   - 深色模式支持
   - 现代化UI组件

## 常见问题

### 端口占用

#### Windows
```powershell
# 查找占用端口的进程
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# 终止进程
taskkill /PID <进程ID> /F
```

#### macOS/Linux
```bash
# 查找占用端口的进程
lsof -i :8000
lsof -i :3000

# 终止进程
kill -9 <进程ID>
```

### Python包安装问题

```bash
# 升级pip
python -m pip install --upgrade pip

# 清除pip缓存
pip cache purge

# 使用国内镜像 (中国用户)
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### Node.js包安装问题

```bash
# 清除npm缓存
npm cache clean --force

# 使用国内镜像 (中国用户)
npm config set registry https://registry.npmmirror.com
```

### Tesseract 路径问题

如果遇到 Tesseract 路径问题，可以在 `.env` 文件中手动设置：

```env
# Windows
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe

# macOS (Homebrew)
TESSERACT_CMD=/usr/local/bin/tesseract

# Linux
TESSERACT_CMD=/usr/bin/tesseract
```

## 许可证

[MIT License](LICENSE)

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request
