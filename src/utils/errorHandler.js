// 统一错误处理中间件

/**
 * 错误处理中间件
 * @param {Error} err - 错误对象
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
function errorHandler(err, req, res, next) {
  // 如果是404错误
  if (err.status === 404) {
    return res.status(404).json({
      error: err.message || "Resource not found"
    });
  }

  // 如果是其他已知错误
  if (err.status) {
    return res.status(err.status).json({
      error: err.message
    });
  }

  // 未知错误，返回500
  console.error("Unexpected error:", err);
  res.status(500).json({
    error: "Internal server error"
  });
}

/**
 * 404处理中间件（放在所有路由之后）
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: "Route not found"
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};

