# 多阶段构建 - 支持 ARM64 和 AMD64
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

WORKDIR /app

# 设置 npm 镜像源和超时配置
RUN npm config set registry https://registry.npmmirror.com && \
    npm config set fetch-timeout 60000 && \
    npm config set fetch-retries 3

# 复制依赖文件
COPY package*.json ./

# 安装依赖（带重试）
RUN npm ci --prefer-offline || npm ci || npm install

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 生产阶段 - 使用 nginx 提供静态文件服务
FROM --platform=$TARGETPLATFORM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
