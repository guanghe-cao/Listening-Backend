# 使用 Node.js 20 LTS 作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装生产依赖（使用 npm ci 确保依赖版本一致）
RUN npm ci --only=production

# 复制应用代码
COPY src/ ./src/

# 暴露端口（默认 3000，可通过环境变量覆盖）
EXPOSE 3000

# 设置环境变量（默认值，可通过 docker run -e 或 --env-file 覆盖）
ENV PORT=3000
ENV NODE_ENV=production

# 启动应用（使用 npm start，与 package.json 中的脚本一致）
CMD ["npm", "start"]

