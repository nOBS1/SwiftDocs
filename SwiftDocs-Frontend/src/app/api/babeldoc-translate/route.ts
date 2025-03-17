import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { 
  checkPythonInstallation, 
  checkPipInstallation, 
  checkBabelDocInstallation, 
  installBabelDoc,
  getPythonCommand,
  getPipCommand
} from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('接收到 BabelDOC 翻译请求');
    
    // 检查 Python 是否已安装
    const pythonInstalled = await checkPythonInstallation();
    if (!pythonInstalled) {
      console.error('Python 未安装');
      return NextResponse.json(
        { 
          error: '未安装 Python，请先安装 Python 3.8 或更高版本',
          details: '要使用 BabelDOC 功能，需要安装 Python 3.8+ 并确保其在系统 PATH 中。'
        },
        { status: 500 }
      );
    }
    
    // 获取 Python 命令
    const pythonCmd = await getPythonCommand();
    if (!pythonCmd) {
      console.error('未找到可用的 Python 命令');
      return NextResponse.json(
        { 
          error: '未找到可用的 Python 命令',
          details: '请确保 Python 命令可在命令行中使用。'
        },
        { status: 500 }
      );
    }

    // 检查 pip 是否已安装
    const pipInstalled = await checkPipInstallation();
    if (!pipInstalled) {
      console.error('pip 未安装');
      return NextResponse.json(
        { 
          error: '未安装 pip，请先安装 pip',
          details: '要使用 BabelDOC 功能，需要安装 pip 并确保其在系统 PATH 中。'
        },
        { status: 500 }
      );
    }
    
    // 获取 pip 命令
    const pipCmd = await getPipCommand();
    if (!pipCmd) {
      console.error('未找到可用的 pip 命令');
      return NextResponse.json(
        { 
          error: '未找到可用的 pip 命令',
          details: '请确保 pip 命令可在命令行中使用。'
        },
        { status: 500 }
      );
    }

    // 检查 babeldoc 是否已安装
    let babelDocInstalled = await checkBabelDocInstallation();
    if (!babelDocInstalled) {
      console.log('正在安装 babeldoc...');
      babelDocInstalled = await installBabelDoc();
      if (!babelDocInstalled) {
        console.error('安装 babeldoc 失败');
        return NextResponse.json(
          { 
            error: '安装 babeldoc 失败，请手动安装',
            details: `
BabelDOC 安装失败。请尝试手动安装：

1. 安装 uv 工具：
   pip install uv

2. 使用 uv 安装 BabelDOC：
   uv tool install --python 3.12 BabelDOC

或者从 GitHub 安装：
   pip install git+https://github.com/funstory-ai/BabelDOC.git

安装后重试。
            `
          },
          { status: 500 }
        );
      }
    }

    // 解析请求数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetLang = (formData.get('targetLang') as string) || 'zh-CN';
    const service = (formData.get('service') as string) || 'openai';
    const apiKey = (formData.get('apiKey') as string) || '';
    const preserveFormat = formData.get('preserveFormat') === 'true'; // 解析格式保留选项

    if (!file) {
      console.error('未提供文件');
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }

    console.log(`处理文件: ${file.name}, 大小: ${file.size} 字节`);
    console.log(`目标语言: ${targetLang}, 翻译服务: ${service}, 保留格式: ${preserveFormat}`);

    // 创建临时目录
    const sessionId = uuidv4();
    const tempDir = path.join(os.tmpdir(), 'pdf-translator', sessionId);
    await fs.mkdir(tempDir, { recursive: true });
    console.log(`创建临时目录: ${tempDir}`);

    // 保存上传的文件
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(tempDir, file.name);
    await fs.writeFile(filePath, fileBuffer);
    console.log(`保存文件到: ${filePath}`);

    // 获取 Python 脚本路径
    const scriptPath = path.join(process.cwd(), 'src', 'app', 'api', 'babeldoc-translate', 'babeldoc-api.py');

    // 确保 Python 脚本存在
    try {
      await fs.access(scriptPath);
      console.log(`找到 Python 脚本: ${scriptPath}`);
    } catch (error) {
      console.error(`Python 脚本不存在: ${scriptPath}`, error);
      return NextResponse.json(
        { 
          error: `Python 脚本不存在: ${scriptPath}`,
          details: '请确保应用程序文件完整。'
        },
        { status: 500 }
      );
    }

    // 执行 Python 脚本
    const preserveFormatFlag = preserveFormat ? '--preserve-format' : '';
    const command = `${pythonCmd} "${scriptPath}" "${filePath}" --output-dir "${tempDir}" --lang-out "${targetLang}" --service "${service}" --api-key "${apiKey}" ${preserveFormatFlag}`;
    
    console.log('执行命令:', command.replace(apiKey, '********'));
    
    const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          console.error('执行 Python 脚本出错:', error);
          console.error('脚本错误输出:', stderr);
          reject({ error, stderr });
        } else {
          console.log('Python 脚本执行成功');
          resolve({ stdout, stderr });
        }
      });
    }).catch(error => {
      console.error('执行 Python 脚本失败:', error);
      return { stdout: '', stderr: error.stderr || '执行 Python 脚本失败' };
    });

    // 解析 Python 脚本输出
    let response;
    try {
      response = JSON.parse(result.stdout);
      console.log('成功解析 Python 脚本输出');
    } catch (error) {
      console.error('解析 Python 脚本输出失败:', error);
      console.error('脚本输出:', result.stdout);
      console.error('脚本错误:', result.stderr);
      
      return NextResponse.json(
        { 
          error: '处理 PDF 失败，无法解析脚本输出',
          details: '脚本可能未正确执行或输出格式不正确。',
          stdout: result.stdout,
          stderr: result.stderr
        },
        { status: 500 }
      );
    }

    // 如果处理失败，返回错误信息
    if (response.error) {
      console.error('Python 脚本报告错误:', response.error);
      return NextResponse.json(
        { 
          error: response.error, 
          text: response.text,
          details: '处理 PDF 时出现错误，请查看详细信息。'
        },
        { status: 500 }
      );
    }

    // 处理文件路径，转换为可访问的 URL
    const baseUrl = request.nextUrl.origin;
    const publicDir = path.join(process.cwd(), 'public', 'temp', sessionId);
    await fs.mkdir(publicDir, { recursive: true });
    console.log(`创建公共目录: ${publicDir}`);

    // 复制生成的文件到公共目录
    const copyFiles = async () => {
      const files = {
        monoPdf: response.monoPdfPath,
        dualPdf: response.dualPdfPath,
        text: response.textPath
      };

      const urls: Record<string, string> = {};

      for (const [key, filePath] of Object.entries(files)) {
        if (filePath) {
          try {
            const fileName = path.basename(filePath);
            const publicPath = path.join(publicDir, fileName);
            await fs.copyFile(filePath, publicPath);
            urls[key] = `/temp/${sessionId}/${fileName}`;
            console.log(`复制文件 ${key}: ${filePath} -> ${publicPath}`);
          } catch (error) {
            console.error(`复制文件失败 (${key}):`, error);
          }
        }
      }

      return urls;
    };

    const fileUrls = await copyFiles();
    console.log('文件 URL:', fileUrls);

    // 返回处理结果
    console.log('处理完成，返回结果');
    return NextResponse.json({
      success: true,
      originalText: response.originalText || '',
      translatedText: response.translatedText || '',
      sessionId,
      files: fileUrls
    });

  } catch (error: any) {
    console.error('API 处理出错:', error);
    return NextResponse.json(
      { 
        error: `处理请求时出错: ${error.message || '未知错误'}`,
        details: error.stack || '未提供详细错误信息'
      },
      { status: 500 }
    );
  }
} 