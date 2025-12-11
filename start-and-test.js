// 启动服务器并运行测试

const http = require('http');
const { spawn } = require('child_process');

const BASE_URL = 'http://localhost:3000';
const MAX_RETRIES = 10;
const RETRY_DELAY = 500;

let serverProcess;

// 启动服务器
function startServer() {
  console.log('🚀 启动服务器...\n');
  serverProcess = spawn('node', ['src/app.js'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server is running')) {
      console.log('✅ 服务器已启动\n');
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`服务器错误: ${data}`);
  });

  return new Promise((resolve) => {
    setTimeout(resolve, 2000); // 等待服务器启动
  });
}

// 检查服务器是否就绪
function checkServerReady(retries = 0) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}/health`, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`服务器返回状态码: ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      if (retries < MAX_RETRIES) {
        setTimeout(() => {
          checkServerReady(retries + 1).then(resolve).catch(reject);
        }, RETRY_DELAY);
      } else {
        reject(err);
      }
    });

    req.setTimeout(1000, () => {
      req.destroy();
      if (retries < MAX_RETRIES) {
        setTimeout(() => {
          checkServerReady(retries + 1).then(resolve).catch(reject);
        }, RETRY_DELAY);
      } else {
        reject(new Error('服务器启动超时'));
      }
    });
  });
}

// 发送 HTTP 请求
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

// 运行测试
async function runTests() {
  console.log('🧪 开始测试 API...\n');

  const tests = [
    {
      name: '健康检查端点',
      path: '/health',
      validate: (result) => {
        return result.status === 200 && result.data.status === 'ok';
      }
    },
    {
      name: '根路径',
      path: '/',
      validate: (result) => {
        return result.status === 200 && result.data.message;
      }
    },
    {
      name: '获取文章列表（分页）',
      path: '/articles?page=1&pageSize=3',
      validate: (result) => {
        return result.status === 200 && 
               result.data.items && 
               result.data.items.length > 0 &&
               !result.data.items[0].content; // 列表不应包含 content
      }
    },
    {
      name: '获取单篇文章',
      path: '/articles/1',
      validate: (result) => {
        return result.status === 200 && 
               result.data.id === '1' && 
               result.data.content; // 详情应包含 content
      }
    },
    {
      name: '获取不存在的文章（404）',
      path: '/articles/999',
      validate: (result) => {
        return result.status === 404 && result.data.error;
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`测试: ${test.name}...`);
      const result = await makeRequest(test.path);
      
      if (test.validate(result)) {
        console.log(`   ✅ 通过 (状态码: ${result.status})`);
        if (test.path.includes('/articles/1')) {
          console.log(`   📄 文章标题: ${result.data.title}`);
          console.log(`   📝 Content 长度: ${result.data.content.length} 字符`);
        } else if (test.path.includes('/articles?')) {
          console.log(`   📚 返回 ${result.data.items.length} 篇文章，总计 ${result.data.total} 篇`);
        }
        passed++;
      } else {
        console.log(`   ❌ 失败: 验证未通过`);
        console.log(`   响应:`, JSON.stringify(result.data, null, 2));
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error.message}`);
      failed++;
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════');
  console.log(`✨ 测试完成: ${passed} 通过, ${failed} 失败`);
  console.log('═══════════════════════════════════════\n');
}

// 主函数
async function main() {
  try {
    await startServer();
    console.log('⏳ 等待服务器就绪...\n');
    await checkServerReady();
    console.log('✅ 服务器已就绪，开始测试\n');
    await runTests();
    
    console.log('🛑 正在关闭服务器...');
    if (serverProcess) {
      serverProcess.kill();
    }
    console.log('✅ 服务器已关闭\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(1);
  }
}

main();

