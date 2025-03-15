# PDF翻译工具

一个基于Next.js的PDF文档翻译工具，支持多种翻译服务和语言。

## 功能特点

- 📄 上传PDF文件并提取文本内容
- 🌐 支持多种翻译服务（Google翻译、DeepL、OpenAI、DeepSeek、Azure AI翻译、百度翻译）
- 🔄 支持多种目标语言（中文、英文、日文、韩文、法文、德文、西班牙文、俄文）
- 📊 对照视图显示原文和翻译结果
- 💾 下载翻译结果
- 📋 复制翻译结果到剪贴板
- 📱 响应式设计，适配各种设备
- 🌓 支持亮色/暗色主题
- 📜 保存翻译历史记录
- 🧮 **科学论文翻译支持**，使用 [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate) 保留公式、图表和表格格式
- 🔬 **新功能：BabelDOC 集成**，使用 [BabelDOC](https://github.com/OpenBMB/BabelDOC) 提供更高质量的科学论文翻译，保留完整格式
- 支持多种翻译服务：OpenAI、Google、DeepL、Azure、DeepSeek
- 自动检测和提取 PDF 文本
- 支持科学论文翻译（使用 PDFMathTranslate 或 BabelDOC）
- 实时翻译进度显示
- 历史记录保存
- 支持下载翻译结果为文本文件或 PDF 文件
  - PDF 文件支持中文显示，无乱码问题
  - 自动分页处理长文本
  - BabelDOC 生成的 PDF 保留原始格式

## 技术栈

- **前端框架**：Next.js 14 (App Router)
- **UI组件**：Shadcn UI
- **状态管理**：Zustand
- **PDF处理**：PDF.js
- **科学论文处理**：
  - PDFMathTranslate (pdf2zh)
  - BabelDOC (babeldoc)
- **翻译服务**：OpenAI、DeepSeek、Google、百度翻译
- **样式**：Tailwind CSS
- **动画**：Framer Motion
- **类型检查**：TypeScript

## 开始使用

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

安装完成后，会自动下载 PDF.js worker 文件到 public 目录。如果需要手动下载，可以运行：

```bash
npm run download-pdf-worker
```

> **注意**：PDF.js 4.8.69 版本的 worker 文件使用 `.mjs` 扩展名而不是 `.js`。如果遇到 worker 文件下载 404 错误，请检查脚本中的文件扩展名是否正确。

### 配置翻译服务 API 密钥

1. 复制 `.env.example` 文件为 `.env.local`
2. 在 `.env.local` 文件中填入你的 API 密钥：

```
# API密钥配置
# OpenAI API密钥
OPENAI_API_KEY=your_openai_api_key

# DeepSeek API密钥
DEEPSEEK_API_KEY=your_deepseek_api_key

# 百度翻译API
BAIDU_APP_ID=your_baidu_app_id
BAIDU_APP_KEY=your_baidu_app_key

# 谷歌翻译API（如果使用官方API）
GOOGLE_API_KEY=your_google_api_key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

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