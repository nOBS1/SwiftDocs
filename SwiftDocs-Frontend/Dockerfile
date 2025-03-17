FROM node:16-alpine AS builder

WORKDIR /app

# 复制项目文件
COPY package.json package-lock.json ./
COPY next.config.js ./
COPY tsconfig.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY components.json ./
COPY public ./public
COPY src ./src

# 安装依赖
RUN npm ci

# 构建应用
RUN npm run build

# 生产环境
FROM node:16-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 复制构建产物
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"] 