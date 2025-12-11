// 文章控制器

const prisma = require('../lib/prisma');

/**
 * 获取文章列表（分页）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
async function getArticles(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    // 验证参数
    if (page < 1) {
      return res.status(400).json({
        error: "Page must be greater than 0"
      });
    }
    if (pageSize < 1 || pageSize > 100) {
      return res.status(400).json({
        error: "PageSize must be between 1 and 100"
      });
    }

    // 从数据库查询文章（目前返回所有文章，预留 authorId 过滤）
    const skip = (page - 1) * pageSize;
    
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          preview: true,
          createdAt: true,
          isImportant: true,
          authorId: true, // 预留字段
        },
      }),
      prisma.article.count(),
    ]);

    // 格式化返回数据
    const items = articles.map(article => ({
      id: article.id,
      title: article.title,
      preview: article.preview,
      createdAt: article.createdAt.toISOString(),
      isImportant: article.isImportant,
      authorId: article.authorId, // 预留字段
    }));

    res.json({
      items,
      page,
      pageSize,
      total
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    next(error);
  }
}

/**
 * 根据ID获取单篇文章
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
async function getArticle(req, res, next) {
  try {
    const { id } = req.params;
    
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        preview: true,
        content: true,
        createdAt: true,
        isImportant: true,
        authorId: true, // 预留字段
      },
    });

    if (!article) {
      const error = new Error("Article not found");
      error.status = 404;
      return next(error);
    }

    // 返回完整文章，包括 content
    res.json({
      id: article.id,
      title: article.title,
      preview: article.preview,
      content: article.content,
      createdAt: article.createdAt.toISOString(),
      isImportant: article.isImportant,
      authorId: article.authorId, // 预留字段
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    next(error);
  }
}

module.exports = {
  getArticles,
  getArticle
};

