import { exec } from 'child_process';

/**
 * 检查 Python 是否已安装
 */
export function checkPythonInstallation(): Promise<boolean> {
  console.log('检查 Python 安装...');
  return new Promise((resolve) => {
    exec('python --version', (error) => {
      if (error) {
        console.log('python 命令不可用，尝试 python3 命令...');
        // 尝试 python3 命令
        exec('python3 --version', (error2) => {
          if (error2) {
            console.error('Python 未安装或不在 PATH 中');
            resolve(false);
          } else {
            console.log('找到 Python (python3)');
            resolve(true);
          }
        });
      } else {
        console.log('找到 Python (python)');
        resolve(true);
      }
    });
  });
}

/**
 * 获取可用的 Python 命令
 */
export function getPythonCommand(): Promise<string | null> {
  console.log('获取可用的 Python 命令...');
  return new Promise((resolve) => {
    // 尝试 python 命令
    exec('python --version', (error) => {
      if (error) {
        // 尝试 python3 命令
        exec('python3 --version', (error2) => {
          if (error2) {
            console.error('未找到可用的 Python 命令');
            resolve(null);
          } else {
            console.log('使用 python3 命令');
            resolve('python3');
          }
        });
      } else {
        console.log('使用 python 命令');
        resolve('python');
      }
    });
  });
}

/**
 * 检查 pip 是否已安装
 */
export function checkPipInstallation(): Promise<boolean> {
  console.log('检查 pip 安装...');
  return new Promise((resolve) => {
    exec('pip --version', (error) => {
      if (error) {
        console.log('pip 命令不可用，尝试 pip3 命令...');
        // 尝试 pip3 命令
        exec('pip3 --version', (error2) => {
          if (error2) {
            console.error('pip 未安装或不在 PATH 中');
            resolve(false);
          } else {
            console.log('找到 pip (pip3)');
            resolve(true);
          }
        });
      } else {
        console.log('找到 pip (pip)');
        resolve(true);
      }
    });
  });
}

/**
 * 获取可用的 pip 命令
 */
export function getPipCommand(): Promise<string | null> {
  console.log('获取可用的 pip 命令...');
  return new Promise((resolve) => {
    // 尝试 pip 命令
    exec('pip --version', (error) => {
      if (error) {
        // 尝试 pip3 命令
        exec('pip3 --version', (error2) => {
          if (error2) {
            // 尝试 python -m pip
            exec('python -m pip --version', (error3) => {
              if (error3) {
                // 尝试 python3 -m pip
                exec('python3 -m pip --version', (error4) => {
                  if (error4) {
                    console.error('未找到可用的 pip 命令');
                    resolve(null);
                  } else {
                    console.log('使用 python3 -m pip 命令');
                    resolve('python3 -m pip');
                  }
                });
              } else {
                console.log('使用 python -m pip 命令');
                resolve('python -m pip');
              }
            });
          } else {
            console.log('使用 pip3 命令');
            resolve('pip3');
          }
        });
      } else {
        console.log('使用 pip 命令');
        resolve('pip');
      }
    });
  });
}

/**
 * 检查 babeldoc 是否已安装
 */
export function checkBabelDocInstallation(): Promise<boolean> {
  console.log('检查 babeldoc 安装...');
  return new Promise(async (resolve) => {
    const pythonCmd = await getPythonCommand();
    if (!pythonCmd) {
      console.error('未找到可用的 Python 命令，无法检查 babeldoc 安装');
      resolve(false);
      return;
    }
    
    // 尝试运行 babeldoc 命令
    exec(`${pythonCmd} -c "import babeldoc"`, (error) => {
      if (error) {
        console.error('babeldoc 未安装或无法导入');
        resolve(false);
      } else {
        console.log('找到 babeldoc 安装');
        resolve(true);
      }
    });
  });
}

/**
 * 安装 babeldoc
 * 注意：BabelDOC 推荐使用 uv 工具安装，但这里我们仍然使用 pip 尝试安装
 * 如果安装失败，用户需要手动安装
 */
export function installBabelDoc(): Promise<boolean> {
  console.log('开始安装 babeldoc...');
  return new Promise(async (resolve) => {
    const pipCmd = await getPipCommand();
    if (!pipCmd) {
      console.error('未找到可用的 pip 命令，无法安装 babeldoc');
      resolve(false);
      return;
    }
    
    console.log(`尝试使用 ${pipCmd} 安装 babeldoc...`);
    exec(`${pipCmd} install babeldoc`, (error, stdout, stderr) => {
      if (error) {
        console.error('使用 pip 安装 babeldoc 失败:', error);
        console.error('安装输出:', stderr);
        
        // 尝试使用 pip 安装 git 版本
        console.log('尝试从 GitHub 安装 babeldoc...');
        exec(`${pipCmd} install git+https://github.com/funstory-ai/BabelDOC.git`, (error2, stdout2, stderr2) => {
          if (error2) {
            console.error('从 GitHub 安装 babeldoc 失败:', error2);
            console.error('安装输出:', stderr2);
            resolve(false);
          } else {
            console.log('从 GitHub 安装 babeldoc 成功');
            console.log('安装输出:', stdout2);
            
            // 安装后再次检查是否成功安装
            checkBabelDocInstallation().then(installed => {
              if (!installed) {
                console.error('安装后检查失败，babeldoc 可能未正确安装');
                resolve(false);
              } else {
                resolve(true);
              }
            });
          }
        });
      } else {
        console.log('babeldoc 安装成功');
        console.log('安装输出:', stdout);
        
        // 安装后再次检查是否成功安装
        checkBabelDocInstallation().then(installed => {
          if (!installed) {
            console.error('安装后检查失败，babeldoc 可能未正确安装');
            resolve(false);
          } else {
            resolve(true);
          }
        });
      }
    });
  });
} 