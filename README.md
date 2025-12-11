# Listen Backend

为 iOS 阅读应用提供新闻内容的后端 API 服务。

## 项目结构

```
Listenbackend/
├── prisma/
│   ├── schema.prisma          # Prisma schema 定义
│   ├── seed.js                # 数据库种子脚本
│   └── migrations/             # 数据库迁移文件（自动生成）
├── src/
│   ├── app.js                 # Express 应用主文件
│   ├── lib/
│   │   └── prisma.js          # Prisma 客户端实例
│   ├── routes/                # 路由定义
│   │   ├── articleRoutes.js
│   │   ├── authRoutes.js
│   │   └── tts.js
│   ├── controllers/           # 控制器逻辑
│   │   ├── articleController.js
│   │   ├── authController.js
│   │   └── ttsController.js
│   ├── data/                  # 数据层（已废弃，改用数据库）
│   │   └── articles.js
│   └── utils/                 # 工具函数
│       └── errorHandler.js
├── .env.example               # 环境变量示例文件
├── package.json
└── README.md
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 DashScope API Key 和数据库配置：

```
DASHSCOPE_API_KEY=your_dashscope_api_key_here
DATABASE_URL="file:./dev.db"
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
```

**环境变量说明：**
- `DASHSCOPE_API_KEY`: 阿里云 DashScope API Key（用于 TTS 服务）
- `DATABASE_URL`: SQLite 数据库文件路径（默认 `file:./dev.db`）
- `PORT`: 服务器端口（默认 3000）
- `JWT_SECRET`: JWT 密钥（用于生成登录 token，生产环境请使用强随机字符串）

**获取 DashScope API Key：**
1. 访问 https://dashscope-intl.console.aliyun.com/
2. 登录或注册阿里云账号
3. 开通 DashScope 服务
4. 创建新的 API Key
5. 将 Key 复制到 `.env` 文件中

**注意**：`.env` 文件已添加到 `.gitignore`，不会被提交到版本控制。

### 3. 初始化数据库

#### 安装 Prisma CLI（如果还没有安装）

Prisma CLI 已经包含在 `devDependencies` 中，运行 `npm install` 后即可使用。

#### 生成 Prisma Client

```bash
npm run prisma:generate
```

#### 运行数据库迁移

```bash
npm run prisma:migrate
```

这会创建 SQLite 数据库文件（默认 `prisma/dev.db`）并应用 schema。

#### 初始化测试数据

```bash
npm run prisma:seed
```

这会创建两个测试用户和几篇测试文章：
- 用户1: `testuser` / `password123`
- 用户2: `admin` / `test456`

#### 查看数据库（可选）

使用 Prisma Studio 可视化查看和编辑数据：

```bash
npm run prisma:studio
```

然后在浏览器中打开 http://localhost:5555

### 4. 启动服务器

**开发模式：**
```bash
npm run dev
```

**生产模式：**
```bash
npm run build
npm start
```

服务器默认运行在 `http://localhost:3000`

### 5. 生产环境部署

#### 使用 PM2（推荐）

PM2 是一个 Node.js 进程管理器，可以保持应用运行并在崩溃时自动重启。

**安装 PM2：**
```bash
npm install -g pm2
```

**启动应用：**
```bash
# 使用 ecosystem 配置文件（推荐）
pm2 start ecosystem.config.js

# 或直接启动
pm2 start dist/server.js --name listen-backend
```

**常用 PM2 命令：**
```bash
pm2 status              # 查看状态
pm2 logs listen-backend # 查看日志
pm2 restart listen-backend # 重启
pm2 stop listen-backend    # 停止
pm2 delete listen-backend # 删除

# 保存配置以便开机自启
pm2 save
pm2 startup
```

**详细部署指南：**

请参考 [DO_DEPLOYMENT_GUIDE.md](./DO_DEPLOYMENT_GUIDE.md) 了解完整的 DigitalOcean Droplet 部署步骤。

### 5. 使用环境变量（可选）

```bash
PORT=8080 npm start
```

## 数据库管理

### Prisma 常用命令

```bash
# 生成 Prisma Client
npm run prisma:generate

# 创建并应用数据库迁移
npm run prisma:migrate

# 初始化测试数据
npm run prisma:seed

# 打开 Prisma Studio（可视化数据库）
npm run prisma:studio
```

### 数据库 Schema

项目使用 Prisma ORM 管理数据库，schema 定义在 `prisma/schema.prisma`：

- **User 表**：用户信息
  - `id`: UUID（主键）
  - `username`: 用户名（唯一）
  - `passwordHash`: 密码哈希
  - `createdAt`: 创建时间

- **Article 表**：文章信息
  - `id`: UUID（主键）
  - `title`: 标题
  - `preview`: 预览/摘要
  - `content`: 正文内容
  - `createdAt`: 创建时间
  - `isImportant`: 是否重要
  - `authorId`: 作者 ID（外键，关联 User）

### 本地查看数据

1. **使用 Prisma Studio**（推荐）：
   ```bash
   npm run prisma:studio
   ```

2. **使用 SQLite 命令行工具**：
   ```bash
   sqlite3 prisma/dev.db
   .tables          # 查看所有表
   SELECT * FROM users;
   SELECT * FROM articles;
   ```

## API 端点

### 健康检查

```bash
curl http://localhost:3000/health
```

响应：
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 获取文章列表

```bash
# 获取第一页，默认每页20条
curl http://localhost:3000/articles

# 指定页码和每页数量
curl "http://localhost:3000/articles?page=1&pageSize=10"
```

响应示例：
```json
{
  "items": [
    {
      "id": "1",
      "title": "人工智能的发展历程",
      "preview": "人工智能从诞生到现在已经走过了70多年的历程...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 10
}
```

**注意**：列表接口不返回 `content` 字段，只返回 `preview` 摘要。

### 获取单篇文章详情

```bash
curl http://localhost:3000/articles/1
```

响应示例：
```json
{
  "id": "1",
  "title": "人工智能的发展历程",
  "preview": "人工智能从诞生到现在已经走过了70多年的历程...",
  "content": "人工智能（Artificial Intelligence，简称AI）从诞生到现在...",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

如果文章不存在，返回 404：
```json
{
  "error": "Article not found"
}
```

**注意**：文章数据现在从 SQLite 数据库读取，不再是内存数据。

### 用户认证

**POST /auth/login** - 用户登录

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

**请求体：**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**响应：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "test-user-1",
    "username": "testuser"
  }
}
```

**测试用户：**
- 用户名: `testuser`，密码: `password123`
- 用户名: `admin`，密码: `test456`

**错误响应：**

缺少用户名或密码：
```json
{
  "error": "Username and password are required"
}
```

用户名或密码错误：
```json
{
  "error": "Invalid username or password"
}
```

**注意**：
- 当前使用硬编码的测试用户（MVP 阶段）
- 返回的 JWT token 有效期为 7 天
- 后续版本将改为从数据库验证用户

### 文本转语音 (TTS)

**POST /tts** - 将文本转换为语音（WAV 格式）

使用阿里云百炼（DashScope）的 Qwen3-TTS-Flash 模型生成语音。

**默认使用 Jennifer 语音：**
```bash
curl -X POST http://localhost:3000/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"欢迎来到我们的播客，Hello everyone, this is Jennifer speaking."}' \
  --output tts_jennifer.wav
```

**自定义语音（覆盖为 Cherry）：**
```bash
curl -X POST http://localhost:3000/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"欢迎来到我们的播客，Hello everyone, this is Jennifer speaking.", "voice": "Cherry"}' \
  --output tts_cherry.wav
```

**请求体：**
```json
{
  "text": "要朗读的全文（通常是一篇新闻，支持中英文混合）",
  "voice": "Jennifer"    // 可选，默认 "Jennifer"，可选值：Jennifer, Cherry 等（具体可用音色请参考 DashScope 文档）
}
```

**响应：**
- 成功：返回 WAV 音频文件（Content-Type: `audio/wav`）
- 错误：返回 JSON 格式错误信息

**错误响应示例：**

缺少 text 参数：
```json
{
  "error": "text is required"
}
```

文本长度超过限制（10,000 字符）：
```json
{
  "error": "Text length exceeds maximum limit of 10000 characters"
}
```

API Key 未配置：
```json
{
  "error": "DASHSCOPE_API_KEY is not set"
}
```

TTS 生成失败：
```json
{
  "error": "Failed to generate speech"
}
```

**注意：**
- 文本长度限制：10,000 字符
- 默认使用阿里云百炼 Qwen3-TTS-Flash 模型
- 默认语音类型：`Jennifer`（适合中英文混合）
- 可通过请求体中的 `voice` 参数切换其他音色（如 Cherry 等）
- 需要配置 `DASHSCOPE_API_KEY` 环境变量

### 多段文本转语音 (TTS Segments)

**POST /tts/segments** - 将长文本分段转换为多段语音（JSON 格式）

用于处理长文本（如整篇文章）的分段朗读。接口会自动将文本按约 600 字符一段进行智能分段，优先在标点符号处分割，然后为每一段生成语音。

**示例：**
```bash
curl -X POST http://localhost:3000/tts/segments \
  -H "Content-Type: application/json" \
  -d '{"text": "一大段很长很长的文章内容，可能包含上千字。这段文字会被自动分成多段，每段大约600字符，优先在句号、问号、感叹号等标点处分割。每一段都会生成对应的音频，并以 base64 编码返回给客户端。"}'
```

**请求体：**
```json
{
  "text": "要朗读的长文本（支持中英文混合，可以上千字）",
  "voice": "Jennifer"    // 可选，默认 "Jennifer"
}
```

**响应格式（JSON）：**
```json
{
  "segments": [
    {
      "index": 0,
      "text": "第一段被朗读的文本……",
      "audioBase64": "BASE64_ENCODED_WAV_DATA"
    },
    {
      "index": 1,
      "text": "第二段被朗读的文本……",
      "audioBase64": "BASE64_ENCODED_WAV_DATA"
    }
  ],
  "totalSegments": 2
}
```

**响应说明：**
- `segments`: 数组，包含每一段的文本和音频数据
- `index`: 段落的索引，从 0 开始，按顺序递增
- `text`: 该段的原始文本
- `audioBase64`: 该段音频的 base64 编码（WAV 格式）
- `totalSegments`: 总段数

**错误响应示例：**

缺少 text 参数：
```json
{
  "error": "text is required"
}
```

某一段生成失败：
```json
{
  "error": "Failed to generate TTS for segment 2"
}
```

**注意：**
- 分段算法：按约 600 字符一段进行分段，优先在句号（。）、问号（？）、感叹号（！）、分号（；）、换行符等标点处分割
- 如果某一段生成失败，整个请求会中断并返回错误
- iOS 端可以使用 `Data(base64Encoded:)` 将 base64 字符串转换为 Data，然后用 `AVAudioPlayer(data:)` 播放
- 所有段落按顺序生成（串行处理），保证 `index` 的顺序性
- 需要配置 `DASHSCOPE_API_KEY` 环境变量

## 数据结构

### Article 对象

```javascript
{
  id: string,           // 文章唯一标识
  title: string,        // 文章标题
  preview: string,      // 摘要（列表展示用）
  content: string,      // 全文（中文或中英文混杂）
  createdAt: string    // ISO 时间戳
}
```

## 示例数据

项目包含 10 篇示例文章：
- 纯中文文章：2 篇
- 中英混杂文章：2 篇
- 英文文章：6 篇

所有文章数据存储在 `src/data/articles.js` 中，未来可以替换为数据库查询。

## 错误处理

所有错误都返回统一的 JSON 格式：

```json
{
  "error": "错误信息"
}
```

常见错误码：
- `400` - 请求参数错误
- `404` - 资源未找到
- `500` - 服务器内部错误

## CORS 支持

项目已配置 CORS，允许跨域请求，方便 iOS App 在开发阶段访问。

## 技术栈

- Node.js
- Express.js
- Prisma ORM (数据库管理)
- SQLite (数据库，MVP 阶段)
- JWT (用户认证)
- CORS
- node-fetch (用于调用 DashScope API)
- 阿里云百炼 DashScope Qwen3-TTS-Flash (文本转语音)
- dotenv (环境变量管理)

## Deploy to DigitalOcean / Docker 运行说明

项目包含 Dockerfile，可以用于在 DigitalOcean 或其他平台部署。

### 本地 Docker 构建和运行

#### 1. 构建 Docker 镜像

```bash
docker build -t listen-backend .
```

#### 2. 运行 Docker 容器

**方式一：使用环境变量文件（推荐）**

确保项目根目录有 `.env` 文件，包含：
```
DASHSCOPE_API_KEY=your_dashscope_api_key_here
PORT=3000
```

然后运行：
```bash
docker run -p 3000:3000 --env-file .env listen-backend
```

**方式二：直接传递环境变量**

```bash
docker run -p 3000:3000 \
  -e DASHSCOPE_API_KEY=your_dashscope_api_key_here \
  -e PORT=3000 \
  listen-backend
```

#### 3. 验证部署

容器启动后，访问：
- 健康检查：http://localhost:3000/health
- 文章列表：http://localhost:3000/articles
- TTS API：POST http://localhost:3000/tts

### DigitalOcean App Platform 部署

#### 准备工作

1. **将代码推送到 GitHub 仓库**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **在 DigitalOcean 控制台创建 App**
   - 登录 [DigitalOcean 控制台](https://cloud.digitalocean.com/)
   - 点击 "Create" → "Apps"
   - 选择 "GitHub" 作为代码源
   - 授权并选择你的仓库

3. **配置应用设置**
   - **构建方式**：选择 "Dockerfile"
   - **Dockerfile 路径**：`./Dockerfile`（默认）
   - **运行命令**：留空（使用 Dockerfile 中的 CMD）

4. **配置环境变量**
   在 "Environment Variables" 部分添加：
   - `DASHSCOPE_API_KEY`: 你的 DashScope API Key
   - `PORT`: `3000`（可选，默认 3000）
   - `NODE_ENV`: `production`（可选，Dockerfile 已设置）

5. **部署**
   - 点击 "Create Resources"
   - DigitalOcean 会自动构建镜像并部署
   - 部署完成后会得到一个公共 URL（例如：`https://your-app-name.ondigitalocean.app`）

6. **验证部署**
   - 访问 `https://your-app-name.ondigitalocean.app/health`
   - 应该返回 `{"status":"ok","message":"Server is running"}`

7. **在 iOS App 中使用**
   - 将后端 URL 更新为 DigitalOcean 提供的公共 URL
   - 确保 iOS App 可以访问该 URL（可能需要配置 CORS，项目已默认支持）

#### 使用 Droplet（可选）

如果你选择使用 Droplet 而不是 App Platform：

1. 创建 Droplet 并安装 Docker
2. 克隆仓库：`git clone <your-repo-url>`
3. 构建镜像：`docker build -t listen-backend .`
4. 运行容器：
   ```bash
   docker run -d -p 80:3000 \
     -e DASHSCOPE_API_KEY=your_dashscope_api_key_here \
     -e PORT=3000 \
     --name listen-backend \
     --restart unless-stopped \
     listen-backend
   ```
5. 配置 Nginx 反向代理和域名（可选）

## 未来改进

- [ ] 将数据层替换为 DigitalOcean 数据库
- [ ] 添加文章分类/标签功能
- [ ] 添加搜索功能
- [ ] 添加用户认证（如需要）
- [ ] 添加缓存机制

## License

MIT

