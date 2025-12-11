// 文章路由

const express = require('express');
const router = express.Router();
const { getArticles, getArticle } = require('../controllers/articleController');

// GET /articles - 获取文章列表（分页）
router.get('/', getArticles);

// GET /articles/:id - 根据ID获取单篇文章
router.get('/:id', getArticle);

module.exports = router;

