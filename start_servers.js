/**
 * 啟動所有需要的服務器
 * 
 * 使用方法：node start_servers.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 正在啟動所有服務...');

// 啟動主服務器 (端口 3000)
const mainServer = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// 等待 1 秒以確保主服務器已啟動
setTimeout(() => {
  // 啟動 GPT-4o 處理服務 (端口 3001)
  const gpt4oServer = spawn('node', ['server_gpt4o.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });

  gpt4oServer.on('error', (err) => {
    console.error('啟動 GPT-4o 處理服務失敗:', err);
  });

  console.log('✅ 所有服務已啟動');
  console.log('');
  console.log('📋 服務信息:');
  console.log('- 主服務器: http://localhost:3000');
  console.log('- GPT-4o 處理服務: http://localhost:3001');
  console.log('');
  console.log('🌐 請使用您的瀏覽器訪問主頁面');
  console.log('');
  console.log('⚠️ 按 Ctrl+C 停止所有服務');
}, 1000);

mainServer.on('error', (err) => {
  console.error('啟動主服務器失敗:', err);
});

// 處理程序終止信號
process.on('SIGINT', () => {
  console.log('\n🛑 正在關閉所有服務...');
  
  // 確保子進程也被終止
  if (mainServer && !mainServer.killed) {
    mainServer.kill('SIGINT');
  }
  
  // 給進程一點時間來清理
  setTimeout(() => {
    console.log('👋 謝謝使用，再見！');
    process.exit(0);
  }, 500);
});
