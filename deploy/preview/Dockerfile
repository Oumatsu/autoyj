# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────
# autoyj 翻译预览服务器（standalone 模式）
#
# 端口：8080（外部访问）→ 内部 3000
# Tolgee：连接 http://152.32.175.18:8085
# ─────────────────────────────────────────────────────────────────

FROM oven/bun:1-slim

WORKDIR /app

# 1. 先拷贝 package.json 并安装依赖，补充 standalone 缺失的 react/react-dom 等模块
COPY package.json bun.lockb* ./
RUN bun install --production

# 2. 覆盖 standalone 产物与静态资源
COPY standalone/ ./
COPY public/ ./public/

EXPOSE 3000

CMD ["bun", "run", "server.js"]
