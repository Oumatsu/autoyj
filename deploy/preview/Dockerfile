# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────
# autoyj 翻译预览服务器（standalone 模式）
#
# 端口：8080（外部访问）→ 内部 3000
# Tolgee：连接 http://152.32.175.18:8085
# ─────────────────────────────────────────────────────────────────

FROM oven/bun:1-slim

WORKDIR /app

# Copy standalone build and public static assets (self-contained bundle)
COPY standalone/ ./
COPY public/ ./public/

EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["bun", "run", "server.js"]
