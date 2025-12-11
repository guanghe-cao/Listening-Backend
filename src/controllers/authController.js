// 认证控制器

const prisma = require('../lib/prisma');

/**
 * 用户登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
async function login(req, res, next) {
  try {
    console.log("=== LOGIN REQUEST START ===");
    console.log("Request body:", JSON.stringify(req.body));
    
    const { username, password } = req.body;

    if (!username || !password) {
      console.log("Missing username or password");
      return res.status(400).json({
        error: 'Username and password are required',
      });
    }

    console.log("Querying database for username:", username);
    // 从数据库查找用户
    const user = await prisma.user.findUnique({
      where: { username: String(username).trim() },
    });

    console.log("Database query result:", user ? "FOUND" : "NOT FOUND");
    
    if (user) {
      console.log("User details:", {
        id: user.id,
        username: user.username,
        passwordHash: user.passwordHash,
        passwordHashType: typeof user.passwordHash,
        providedPassword: password,
        providedPasswordType: typeof password,
      });
      
      // 转换为字符串并去除空格
      const storedPassword = String(user.passwordHash || "").trim();
      const providedPassword = String(password || "").trim();
      
      console.log("Comparison:", {
        storedPassword: JSON.stringify(storedPassword),
        providedPassword: JSON.stringify(providedPassword),
        areEqual: storedPassword === providedPassword,
      });
    }

    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({
        error: 'Invalid username or password',
      });
    }

    // 明文密码比较
    const storedPassword = String(user.passwordHash || "").trim();
    const providedPassword = String(password || "").trim();
    
    if (storedPassword !== providedPassword) {
      console.log("Password mismatch!");
      return res.status(401).json({
        error: 'Invalid username or password',
      });
    }

    // 成功：返回用户信息和演示 token
    console.log("=== LOGIN SUCCESS ===");
    res.json({
      userId: user.id,
      username: user.username,
      token: 'DEMO_TOKEN',
    });
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
}

module.exports = {
  login,
};

