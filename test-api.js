// API 测试脚本

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
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
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 开始测试 API...\n');

  // 测试 1: 健康检查
  console.log('1️⃣ 测试健康检查端点...');
  try {
    const result = await makeRequest('/health');
    console.log(`   状态码: ${result.status}`);
    console.log(`   响应:`, JSON.stringify(result.data, null, 2));
    console.log('   ✅ 通过\n');
  } catch (error) {
    console.log(`   ❌ 失败: ${error.message}\n`);
  }

  // 测试 2: 根路径
  console.log('2️⃣ 测试根路径...');
  try {
    const result = await makeRequest('/');
    console.log(`   状态码: ${result.status}`);
    console.log(`   响应:`, JSON.stringify(result.data, null, 2));
    console.log('   ✅ 通过\n');
  } catch (error) {
    console.log(`   ❌ 失败: ${error.message}\n`);
  }

  // 测试 3: 获取文章列表
  console.log('3️⃣ 测试获取文章列表...');
  try {
    const result = await makeRequest('/articles?page=1&pageSize=3');
    console.log(`   状态码: ${result.status}`);
    if (result.data.items) {
      console.log(`   返回 ${result.data.items.length} 篇文章`);
      console.log(`   总文章数: ${result.data.total}`);
      console.log(`   第一篇文章标题: ${result.data.items[0]?.title}`);
      console.log(`   是否包含 content: ${result.data.items[0]?.content ? '是' : '否'}`);
    }
    console.log('   ✅ 通过\n');
  } catch (error) {
    console.log(`   ❌ 失败: ${error.message}\n`);
  }

  // 测试 4: 获取单篇文章
  console.log('4️⃣ 测试获取单篇文章...');
  try {
    const result = await makeRequest('/articles/1');
    console.log(`   状态码: ${result.status}`);
    if (result.data.id) {
      console.log(`   文章 ID: ${result.data.id}`);
      console.log(`   文章标题: ${result.data.title}`);
      console.log(`   是否包含 content: ${result.data.content ? '是' : '否'}`);
      console.log(`   content 长度: ${result.data.content?.length || 0} 字符`);
    }
    console.log('   ✅ 通过\n');
  } catch (error) {
    console.log(`   ❌ 失败: ${error.message}\n`);
  }

  // 测试 5: 获取不存在的文章
  console.log('5️⃣ 测试获取不存在的文章（404错误）...');
  try {
    const result = await makeRequest('/articles/999');
    console.log(`   状态码: ${result.status}`);
    console.log(`   响应:`, JSON.stringify(result.data, null, 2));
    if (result.status === 404) {
      console.log('   ✅ 正确返回 404\n');
    } else {
      console.log('   ⚠️  未返回预期的 404\n');
    }
  } catch (error) {
    console.log(`   ❌ 失败: ${error.message}\n`);
  }

  console.log('✨ 测试完成！');
}

// 运行测试
runTests().catch(console.error);

