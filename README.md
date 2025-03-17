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

<<<<<<< HEAD
或者，你也可以在应用的设置页面中配置这些 API 密钥。

### 安装科学论文处理工具 (可选)

#### 安装 PDFMathTranslate

如果需要科学论文翻译功能，需要安装 Python 和 pdf2zh 包：

1. 首先确保已安装 Python 3.6+ 版本：
   ```bash
   # 检查 Python 版本
   python --version
   # 或
   python3 --version
   ```

2. 安装 pdf2zh 包：
   ```bash
   pip install pdf2zh
   # 或
   pip3 install pdf2zh
   # 或
   python -m pip install pdf2zh
   ```

#### 安装 BabelDOC (推荐)

BabelDOC 是一个更强大的科学论文翻译工具，可以更好地保留原始格式：

1. 确保已安装 Python 3.8+ 版本：
   ```bash
   # 检查 Python 版本
   python --version
   # 或
   python3 --version
   ```

2. 安装 babeldoc 包：
   ```bash
   pip install babeldoc
   # 或
   pip3 install babeldoc
   # 或
   python -m pip install babeldoc
   ```

> **注意**：如果您在 macOS 上使用，可能需要使用 `python3` 和 `pip3` 命令。在 Windows 上，通常使用 `python` 和 `pip` 命令。

### 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 翻译服务

### OpenAI

使用 OpenAI 的 GPT-3.5-turbo 模型进行翻译。需要 OpenAI API 密钥，可以在 [OpenAI 平台](https://platform.openai.com/) 获取。

### DeepSeek

使用 DeepSeek-chat 模型进行翻译。需要 DeepSeek API 密钥，可以在 [DeepSeek 平台](https://platform.deepseek.com/) 获取。

### 百度翻译

使用百度翻译 API 进行翻译。需要百度翻译 APP ID 和 APP Key，可以在 [百度翻译开放平台](https://fanyi-api.baidu.com/) 获取。

### Google 翻译

使用 Google 翻译 API 进行翻译。需要 Google API 密钥，可以在 [Google Cloud 控制台](https://console.cloud.google.com/) 获取。

## 项目结构

```
pdf-translator/
├── public/             # 静态资源
│   └── pdf.worker.min.mjs  # PDF.js worker 文件 (注意扩展名为 .mjs)
├── scripts/            # 脚本
│   └── download-pdf-worker.js  # 下载 PDF.js worker 文件的脚本
├── src/                # 源代码
│   ├── app/            # 应用路由
│   │   ├── api/        # API路由
│   │   │   ├── translate/           # 翻译API
│   │   │   ├── pdf-math-translate/  # PDFMathTranslate API
│   │   │   └── babeldoc-translate/  # BabelDOC API
│   │   ├── history/    # 历史记录页面
│   │   └── page.tsx    # 主页
│   ├── components/     # 组件
│   │   ├── ui/         # UI组件
│   │   └── ...         # 其他组件
│   ├── lib/            # 工具函数
│   ├── store/          # 状态管理
│   └── types/          # 类型定义
├── .eslintrc.json      # ESLint配置
├── next.config.js      # Next.js配置
├── package.json        # 项目依赖
├── tailwind.config.js  # Tailwind CSS配置
└── tsconfig.json       # TypeScript配置
```

## 使用说明

1. 上传 PDF 文件
2. 选择处理方式：
   - 标准处理 (PDF.js)：适用于一般文档
   - BabelDOC (推荐)：适用于科学论文，保留完整格式
   - PDFMathTranslate：适用于科学论文，保留公式和图表
3. 选择翻译服务和目标语言
4. 点击"开始翻译"按钮
5. 等待翻译完成
6. 查看翻译结果，可以选择复制或下载结果
   - 支持下载为文本文件 (.txt)
   - 支持下载为 PDF 文件 (.pdf)，保留原文和译文的对照格式，完美支持中文显示
   - 如果使用 BabelDOC 处理，还可以下载保留原始格式的单语言或双语言 PDF

## 科学论文翻译

### PDFMathTranslate

本工具集成了 [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate) 用于处理科学论文，具有以下特点：

- 保留数学公式格式
- 保留图表和表格
- 保留目录和注释
- 支持多种语言和翻译服务
- 生成双语对照文档

### BabelDOC (新功能)

本工具还集成了 [BabelDOC](https://github.com/funstory-ai/BabelDOC)，这是一个更强大的科学论文翻译工具，具有以下特点：

- 更好地保留原始格式，包括公式、图表、表格和布局
- 支持 OpenAI 和 Bing 翻译服务
- 生成单语言和双语言 PDF 文件
- 更高质量的翻译结果
- 支持批量处理

#### 格式保留优化

为了最大程度保留原始PDF的格式，我们提供了"优先保留原始格式"选项：

- 启用此选项将优化BabelDOC的配置，以尽可能保留原始PDF的布局、字体和排版
- 具体优化包括：
  - 不分割短行，保持原始行结构
  - 跳过清理步骤，保留更多原始格式
  - 使用交替页面的双语模式，更好地对比原文和译文
  - 优化最小文本长度，确保短文本也能被正确处理
- 注意：启用此选项可能会略微影响翻译质量，但会大幅提高格式保留度

## 故障排除

### PDF.js 加载失败

如果遇到 PDF.js worker 加载失败的问题，可以尝试以下解决方法：

1. 确保已经运行了 `npm run download-pdf-worker` 命令，下载 PDF.js worker 文件到 public 目录
2. 检查 public 目录下是否存在 `pdf.worker.min.mjs` 文件（注意扩展名为 `.mjs` 而不是 `.js`）
3. 如果仍然无法解决，可以尝试使用 BabelDOC 或 PDFMathTranslate 处理 PDF 文件

### PDFMathTranslate 安装问题

如果遇到 PDFMathTranslate 安装或使用问题，可以尝试以下解决方法：

1. **Python 未找到**：确保 Python 已安装并添加到系统 PATH 中
   ```bash
   # 检查 Python 是否已安装
   python --version
   # 或
   python3 --version
   ```

2. **pip 未找到**：确保 pip 已安装
   ```bash
   # 检查 pip 是否已安装
   pip --version
   # 或
   pip3 --version
   # 或
   python -m pip --version
   ```

3. **pdf2zh 安装失败**：尝试使用不同的 pip 命令安装
   ```bash
   # 使用 pip3
   pip3 install pdf2zh
   
   # 或使用 Python 模块方式
   python -m pip install pdf2zh
   python3 -m pip install pdf2zh
   ```

### BabelDOC 安装问题

如果遇到 BabelDOC 安装或使用问题，可以尝试以下解决方法：

1. **Python 版本过低**：BabelDOC 需要 Python 3.8 或更高版本
   ```bash
   # 检查 Python 版本
   python --version
   # 或
   python3 --version
   ```

2. **安装失败**：尝试使用不同的 pip 命令安装
   ```bash
   # 使用 pip3
   pip3 install babeldoc
   
   # 或使用 Python 模块方式
   python -m pip install babeldoc
   python3 -m pip install babeldoc
   ```

3. **OpenAI API 密钥问题**：如果使用 OpenAI 服务，确保提供了有效的 API 密钥
   - 可以在上传文件时提供 API 密钥
   - 或者在环境变量中设置 `OPENAI_API_KEY`

## 许可证

MIT
=======
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
>>>>>>> 03d12741 (Save changes before rebase)
