# 测试指南

## 快速测试步骤

### 1. 启动服务器

在终端中运行：

```bash
cd /Users/guanghe/Listenbackend
npm start
```

你应该看到：
```
Server is running on port 3000
Health check: http://localhost:3000/health
Articles API: http://localhost:3000/articles
```

### 2. 测试 API 端点

在**另一个终端窗口**中运行以下命令：

#### ✅ 测试 1: 健康检查
```bash
curl http://localhost:3000/health
```

**预期结果：**
```json
{"status":"ok","message":"Server is running"}
```

#### ✅ 测试 2: 根路径
```bash
curl http://localhost:3000/
```

**预期结果：** 返回 API 信息

#### ✅ 测试 3: 获取文章列表
```bash
curl "http://localhost:3000/articles?page=1&pageSize=3"
```

**预期结果：**
- 返回 3 篇文章
- 每篇文章**不包含** `content` 字段
- 包含 `id`, `title`, `preview`, `createdAt`
- 包含分页信息：`page`, `pageSize`, `total`

#### ✅ 测试 4: 获取单篇文章
```bash
curl http://localhost:3000/articles/1
```

**预期结果：**
- 返回完整文章
- **包含** `content` 字段
- 包含所有字段：`id`, `title`, `preview`, `content`, `createdAt`

#### ✅ 测试 5: 测试 404 错误
```bash
curl http://localhost:3000/articles/999
```

**预期结果：**
```json
{"error":"Article not found"}
```
状态码应该是 404

### 3. 使用自动化测试脚本

```bash
# 在服务器运行的情况下，在另一个终端运行：
node test-api.js
```

这会自动测试所有端点并显示结果。

### 4. 验证代码逻辑（无需启动服务器）

```bash
node verify.js
```

这会验证所有模块是否正确加载。

## 测试检查清单

- [ ] 服务器能正常启动
- [ ] `/health` 端点返回正确响应
- [ ] `/articles` 返回文章列表（不含 content）
- [ ] `/articles/:id` 返回完整文章（含 content）
- [ ] 不存在的文章返回 404
- [ ] CORS 已启用（iOS App 可以访问）
- [ ] 错误格式统一为 `{ "error": "..." }`

## 常见问题

### 端口被占用
如果 3000 端口被占用，可以设置环境变量：
```bash
PORT=8080 npm start
```

### 连接被拒绝
确保服务器已启动，检查终端是否有错误信息。

### 测试脚本无法运行
确保在项目根目录运行，且已安装依赖：
```bash
npm install
```

