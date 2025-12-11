// 认证路由

const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// POST /auth/login - 用户登录
router.post('/login', login);

module.exports = router;

