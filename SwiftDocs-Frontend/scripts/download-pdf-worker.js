const fs = require('fs');
const path = require('path');
const https = require('https');

// 创建 public 目录（如果不存在）
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// PDF.js worker 文件的目标路径
const pdfWorkerVersion = '4.8.69'; // 使用与项目相同的版本
const pdfWorkerPath = path.join(publicDir, 'pdf.worker.min.mjs'); // 注意：使用 .mjs 扩展名

// 尝试从 node_modules 复制文件
function copyFromNodeModules() {
  try {
    console.log('尝试从 node_modules 复制 PDF.js worker 文件...');
    
    // 检查 node_modules 中的文件路径 - 注意使用 .mjs 扩展名
    const nodeModulesPath = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
    
    if (fs.existsSync(nodeModulesPath)) {
      fs.copyFileSync(nodeModulesPath, pdfWorkerPath);
      console.log(`成功从 node_modules 复制 PDF.js worker 文件到: ${pdfWorkerPath}`);
      return true;
    } else {
      console.log('在 node_modules 中未找到 PDF.js worker 文件');
      return false;
    }
  } catch (error) {
    console.error('从 node_modules 复制文件失败:', error.message);
    return false;
  }
}

// 从 CDN 下载文件
function downloadFromCDN() {
  // 尝试多个 CDN 源 - 注意使用 .mjs 扩展名
  const cdnUrls = [
    `https://unpkg.com/pdfjs-dist@${pdfWorkerVersion}/build/pdf.worker.min.mjs`,
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfWorkerVersion}/build/pdf.worker.min.mjs`,
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfWorkerVersion}/pdf.worker.min.mjs`
  ];
  
  let currentUrlIndex = 0;
  
  function tryDownload() {
    if (currentUrlIndex >= cdnUrls.length) {
      console.error('所有 CDN 源都下载失败');
      process.exit(1);
      return;
    }
    
    const currentUrl = cdnUrls[currentUrlIndex];
    console.log(`尝试从 CDN 下载 PDF.js worker 文件 (v${pdfWorkerVersion})...`);
    console.log(`从: ${currentUrl}`);
    console.log(`到: ${pdfWorkerPath}`);
    
    const file = fs.createWriteStream(pdfWorkerPath);
    
    https.get(currentUrl, (response) => {
      if (response.statusCode !== 200) {
        console.error(`下载失败，状态码: ${response.statusCode}`);
        file.close();
        fs.unlinkSync(pdfWorkerPath); // 删除可能创建的空文件
        
        // 尝试下一个 CDN
        currentUrlIndex++;
        tryDownload();
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('PDF.js worker 文件下载完成！');
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(pdfWorkerPath); // 删除可能创建的空文件
      console.error(`下载出错: ${err.message}`);
      
      // 尝试下一个 CDN
      currentUrlIndex++;
      tryDownload();
    });
  }
  
  tryDownload();
}

// 首先尝试从 node_modules 复制，如果失败则从 CDN 下载
if (!copyFromNodeModules()) {
  downloadFromCDN();
} 