import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { checkPythonInstallation, checkPipInstallation } from '@/lib/server-utils';

const execAsync = promisify(exec);

// 检查 pdf2zh 是否已安装
async function checkPdf2zhInstalled(pipCmd: string) {
  try {
    await execAsync(`${pipCmd} show pdf2zh`);
    return true;
  } catch (error) {
    console.error('pdf2zh 未安装:', error);
    return false;
  }
}

// 安装 pdf2zh
async function installPdf2zh(pipCmd: string) {
  try {
    console.log('正在安装 pdf2zh...');
    await execAsync(`${pipCmd} install pdf2zh`);
    return true;
  } catch (error) {
    console.error('安装 pdf2zh 失败:', error);
    return false;
  }
}

// 获取可用的 Python 命令
async function getPythonCommand() {
  try {
    // 尝试多个可能的 Python 命令
    const pythonCommands = ['python3', 'python', 'py'];
    
    for (const cmd of pythonCommands) {
      try {
        const { stdout } = await execAsync(`${cmd} --version`);
        console.log(`找到 Python: ${stdout.trim()}`);
        return cmd; // 返回可用的 Python 命令
      } catch (err) {
        // 继续尝试下一个命令
      }
    }
    
    console.error('未找到 Python');
    return null;
  } catch (error) {
    console.error('检查 Python 安装时出错:', error);
    return null;
  }
}

// 获取可用的 pip 命令
async function getPipCommand(pythonCmd: string) {
  try {
    // 尝试多个可能的 pip 命令
    const pipCommands = [`${pythonCmd} -m pip`, 'pip3', 'pip'];
    
    for (const cmd of pipCommands) {
      try {
        const { stdout } = await execAsync(`${cmd} --version`);
        console.log(`找到 pip: ${stdout.trim()}`);
        return cmd; // 返回可用的 pip 命令
      } catch (err) {
        // 继续尝试下一个命令
      }
    }
    
    console.error('未找到 pip');
    return null;
  } catch (error) {
    console.error('检查 pip 安装时出错:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // 检查 Python 是否已安装
    const pythonInstalled = await checkPythonInstallation();
    if (!pythonInstalled) {
      return NextResponse.json(
        { 
          error: '未找到 Python。请确保已安装 Python 3.6+ 并添加到系统 PATH 中。',
          details: '要使用 PDFMathTranslate 功能，需要安装 Python 和 pdf2zh 包。'
        },
        { status: 500 }
      );
    }
    
    // 获取 Python 命令
    const pythonCmd = await getPythonCommand();
    if (!pythonCmd) {
      return NextResponse.json(
        { 
          error: '未找到可用的 Python 命令。',
          details: '请确保 Python 命令可在命令行中使用。'
        },
        { status: 500 }
      );
    }
    
    // 检查 pip 是否已安装
    const pipInstalled = await checkPipInstallation();
    if (!pipInstalled) {
      return NextResponse.json(
        { 
          error: '未找到 pip。请确保已安装 pip 并添加到系统 PATH 中。',
          details: '要使用 PDFMathTranslate 功能，需要安装 pip 和 pdf2zh 包。'
        },
        { status: 500 }
      );
    }
    
    // 获取 pip 命令
    const pipCmd = await getPipCommand(pythonCmd);
    if (!pipCmd) {
      return NextResponse.json(
        { 
          error: '未找到可用的 pip 命令。',
          details: '请确保 pip 命令可在命令行中使用。'
        },
        { status: 500 }
      );
    }

    // 检查是否安装了 pdf2zh
    const isInstalled = await checkPdf2zhInstalled(pipCmd);
    if (!isInstalled) {
      const installSuccess = await installPdf2zh(pipCmd);
      if (!installSuccess) {
        return NextResponse.json(
          { 
            error: '无法安装 PDFMathTranslate (pdf2zh)',
            details: '请手动运行 "pip install pdf2zh" 命令安装，或者使用标准 PDF 处理方式。'
          },
          { status: 500 }
        );
      }
    }

    // 解析请求中的文件
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }

    // 创建临时目录
    const tempDir = path.join(os.tmpdir(), 'pdf-translator');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 生成唯一的文件名
    const uniqueId = uuidv4();
    const inputFilePath = path.join(tempDir, `${uniqueId}-input.pdf`);
    const outputDir = path.join(tempDir, uniqueId);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 将文件保存到临时目录
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(inputFilePath, buffer);

    // 获取 Python 脚本路径
    const scriptPath = path.join(process.cwd(), 'src', 'app', 'api', 'pdf-math-translate', 'python-api.py');
    
    // 确保 Python 脚本存在
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json(
        { error: 'Python 脚本不存在' },
        { status: 500 }
      );
    }

    // 调用 Python 脚本处理 PDF
    const command = `${pythonCmd} "${scriptPath}" "${inputFilePath}" --output-dir "${outputDir}" --lang-out zh --service google`;
    console.log('执行命令:', command);
    
    const { stdout, stderr } = await execAsync(command);
    console.log('Python 脚本输出:', stdout);
    
    if (stderr) {
      console.error('Python 脚本错误:', stderr);
    }

    // 解析 Python 脚本的输出
    let result;
    try {
      result = JSON.parse(stdout);
    } catch (error) {
      console.error('解析 Python 脚本输出失败:', error);
      return NextResponse.json(
        { error: '解析 Python 脚本输出失败' },
        { status: 500 }
      );
    }

    // 检查是否有错误
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // 返回处理结果
    return NextResponse.json({
      success: true,
      text: result.text || '',
      pages: result.pages || 1,
      monoFilePath: result.mono_file,
      dualFilePath: result.dual_file
    });
  } catch (error) {
    console.error('处理 PDF 时出错:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '处理 PDF 时出错' },
      { status: 500 }
    );
  }
} 