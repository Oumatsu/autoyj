# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────
# autoyj 翻译预览服务器（standalone 模式）
#
# 端口：8080（外部访问）→ 内部 3000
# Tolgee：连接 http://152.32.175.18:8085
# ─────────────────────────────────────────────────────────────────

FROM oven/bun:1-slim

WORKDIR /app

# 1. Copy standalone build and public static assets
COPY standalone/ ./
COPY public/ ./public/

# 2. Copy root package.json and force clean Linux production install
COPY package.json ./
RUN rm -rf node_modules && bun install --production

EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["bun", "run", "server.js"]
