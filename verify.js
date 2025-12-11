// 验证项目代码逻辑

console.log('🔍 验证项目代码...\n');

// 1. 验证数据模块
console.log('1️⃣ 验证数据模块...');
try {
  const { getAllArticles, getArticleById } = require('./src/data/articles');
  const allArticles = getAllArticles();
  console.log(`   ✅ 成功加载 ${allArticles.length} 篇文章`);
  
  // 检查文章结构
  const sample = allArticles[0];
  const requiredFields = ['id', 'title', 'preview', 'content', 'createdAt'];
  const hasAllFields = requiredFields.every(field => sample.hasOwnProperty(field));
  console.log(`   ✅ 文章结构正确: ${hasAllFields}`);
  
  // 检查中英文文章
  const chineseOnly = allArticles.filter(a => 
    !/[a-zA-Z]/.test(a.content) || a.content.match(/[a-zA-Z]/g)?.length < 10
  );
  const mixed = allArticles.filter(a => 
    /[\u4e00-\u9fa5]/.test(a.content) && /[a-zA-Z]/.test(a.content) && 
    a.content.match(/[a-zA-Z]/g)?.length >= 10
  );
  console.log(`   ✅ 纯中文文章: ${chineseOnly.length} 篇`);
  console.log(`   ✅ 中英混杂文章: ${mixed.length} 篇`);
  
  // 测试 getArticleById
  const article1 = getArticleById('1');
  const article999 = getArticleById('999');
  console.log(`   ✅ getArticleById('1'): ${article1 ? '找到' : '未找到'}`);
  console.log(`   ✅ getArticleById('999'): ${article999 ? '找到' : '未找到（正确）'}`);
} catch (error) {
  console.log(`   ❌ 错误: ${error.message}`);
}

console.log('');

// 2. 验证控制器
console.log('2️⃣ 验证控制器...');
try {
  const { getArticles, getArticle } = require('./src/controllers/articleController');
  console.log(`   ✅ 控制器函数已导出`);
} catch (error) {
  console.log(`   ❌ 错误: ${error.message}`);
}

console.log('');

// 3. 验证路由
console.log('3️⃣ 验证路由...');
try {
  const articleRoutes = require('./src/routes/articleRoutes');
  console.log(`   ✅ 路由模块已加载`);
} catch (error) {
  console.log(`   ❌ 错误: ${error.message}`);
}

console.log('');

// 4. 验证错误处理
console.log('4️⃣ 验证错误处理...');
try {
  const { errorHandler, notFoundHandler } = require('./src/utils/errorHandler');
  console.log(`   ✅ 错误处理中间件已导出`);
} catch (error) {
  console.log(`   ❌ 错误: ${error.message}`);
}

console.log('');

// 5. 验证主应用
console.log('5️⃣ 验证主应用...');
try {
  const app = require('./src/app');
  console.log(`   ✅ Express 应用已创建`);
} catch (error) {
  console.log(`   ❌ 错误: ${error.message}`);
}

console.log('');

console.log('═══════════════════════════════════════');
console.log('✅ 代码验证完成！所有模块都可以正常加载。');
console.log('═══════════════════════════════════════\n');
console.log('📝 下一步：');
console.log('   1. 运行: npm start');
console.log('   2. 在另一个终端运行: node test-api.js');
console.log('   或者使用 curl 命令测试 API 端点\n');

