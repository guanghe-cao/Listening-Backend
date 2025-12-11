// Express 应用主文件

// 加载环境变量（必须在所有其他 require 之前）
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const articleRoutes = require('./routes/articleRoutes');
const authRoutes = require('./routes/authRoutes');
const ttsRoutes = require('./routes/tts');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的请求体

// 路由
app.use('/articles', articleRoutes);
app.use('/auth', authRoutes);
app.use('/tts', ttsRoutes);

// 也支持直接 /login（兼容 TypeScript 版本）
app.post('/login', require('./controllers/authController').login);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'Listen Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      articles: '/articles',
      articleById: '/articles/:id',
      login: 'POST /auth/login',
      tts: 'POST /tts',
      ttsSegments: 'POST /tts/segments'
    }
  });
});

// 404 处理（放在所有路由之后）
app.use(notFoundHandler);

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Articles API: http://localhost:${PORT}/articles`);
  console.log(`TTS API: POST http://localhost:${PORT}/tts`);
  
  // 检查 DashScope API Key
  if (!process.env.DASHSCOPE_API_KEY) {
    console.warn('⚠️  WARNING: DASHSCOPE_API_KEY is not set. TTS service will not work.');
  } else {
    console.log(`✓ Loaded DASHSCOPE_API_KEY: ${!!process.env.DASHSCOPE_API_KEY}`);
  }
});

module.exports = app;

