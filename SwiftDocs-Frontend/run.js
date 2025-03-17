#!/usr/bin/env node
/**
 * 跨平台前端启动脚本 - 支持 Windows, macOS 和 Linux
 */
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

// 项目根目录
const ROOT_DIR = path.resolve(__dirname);
const ENV_EXAMPLE = path.join(ROOT_DIR, '.env.example');
const ENV_LOCAL = path.join(ROOT_DIR, '.env.local');
const PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * 打印彩色消息
 * @param {string} message 消息内容
 * @param {string} color 颜色
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * 检查Node.js版本
 */
function checkNodeVersion() {
  const nodeVersion = process.version;
  log(`Node.js 版本: ${nodeVersion}`, colors.cyan);
  
  const versionMatch = nodeVersion.match(/^v(\d+)\./);
  if (versionMatch && parseInt(versionMatch[1]) < 16) {
    log('警告: 推荐使用 Node.js 16.0.0 或更高版本', colors.yellow);
  }
}

/**
 * 检查并安装依赖
 */
function checkDependencies() {
  const nodeModules = path.join(ROOT_DIR, 'node_modules');
  
  if (!fs.existsSync(nodeModules)) {
    log('正在安装依赖...', colors.yellow);
    try {
      execSync('npm install', { stdio: 'inherit', cwd: ROOT_DIR });
      log('依赖安装完成', colors.green);
    } catch (error) {
      log('依赖安装失败', colors.red);
      log(error.message, colors.red);
      process.exit(1);
    }
  } else {
    log('依赖已安装', colors.green);
  }
}

/**
 * 检查环境变量文件
 */
function checkEnvFile() {
  if (!fs.existsSync(ENV_LOCAL)) {
    if (fs.existsSync(ENV_EXAMPLE)) {
      log('创建 .env.local 文件...', colors.yellow);
      fs.copyFileSync(ENV_EXAMPLE, ENV_LOCAL);
      log('.env.local 文件已创建，请根据需要修改配置', colors.green);
    } else {
      log('警告: .env.example 文件不存在，无法创建 .env.local', colors.red);
      // 创建基本的 .env.local 文件
      fs.writeFileSync(ENV_LOCAL, `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1\nNEXT_PUBLIC_APP_URL=http://localhost:3000\n`);
      log('已创建基本的 .env.local 文件', colors.yellow);
    }
  } else {
    log('.env.local 文件已存在', colors.green);
  }
}

/**
 * 启动开发服务器
 */
function startDevServer() {
  log('启动开发服务器...', colors.magenta);
  
  const devProcess = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit', 
    cwd: ROOT_DIR,
    shell: true // 在Windows上需要shell
  });
  
  devProcess.on('error', (error) => {
    log(`启动服务器错误: ${error.message}`, colors.red);
  });
  
  // 处理进程退出
  process.on('SIGINT', () => {
    log('正在关闭服务器...', colors.yellow);
    devProcess.kill('SIGINT');
  });
}

/**
 * 主函数
 */
function main() {
  log('===== SwiftDocs 前端启动脚本 =====', colors.cyan);
  log(`操作系统: ${os.type()} ${os.release()}`, colors.blue);
  
  checkNodeVersion();
  checkDependencies();
  checkEnvFile();
  startDevServer();
}

// 执行主函数
main(); 