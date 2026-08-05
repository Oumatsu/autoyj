# Youguard Portal

Youguard 汽车出口 B2B 门户平台。技术栈：Next.js 16 (vinext 1.0+) + React 19 + Cloudflare Workers + Feishu Base。

---

## 快速启动

```bash
# 1. 安装依赖
bun install

# 2. 配置环境变量（复制示例文件）
cp .dev.vars.example .dev.vars
# 然后填入飞书 App ID / App Secret（见下方说明）

# 3. 本地开发服务
bun run dev
```

访问 `http://localhost:3000/portal` 打开门户登录页。

---

## 4种身份账号

> **这些账号仅用于初版**

| 角色 | 邮箱 | Access Code | 权限范围 |
|------|------|-------------|----------|
| **Admin** | `admin@local.test` | `admin-demo-2026` | 全权限：看板、车型、车源、询价、订单、财务、客户、员工 |
| **Sales** | `sales@local.test` | `sales-demo-2026` | 销售视角：车型、询价、订单、出口流程 |
| **Partner** | `partner@example.com` | `partner-demo-2026` | 合作商：车辆资源（合作价）、询价、订单、出口流程 |
| **Customer** | `customer@example.com` | `customer-demo-2026` | 普通客户：车辆库存（无价格）、询价、订单 |

### 登录方式

**方式 1 — 快速填充按钮（推荐用于开发）**

登录页底部点击角色按钮，自动填入邮箱和 Access Code，然后点击"登录"。

**方式 2 — 手动输入**

在邮箱栏填入上表邮箱，Access Code 栏填入对应 code，点击登录。

**方式 3 — Dev Session API（仅 localhost）**

```bash
# 直接获取 admin session（绕过 access code 校验，仅 localhost 可用）
curl -X POST http://localhost:3000/api/portal/dev-session \
  -H "Content-Type: application/json" \
  -d '{"role": "partner"}'
```

---

## 认证架构

### 无注册系统（No-Registration Auth）

本项目采用**仅登录，禁止注册**的认证模式：

```
用户在飞书 Base 中预先创建 → 分配 Access Code → 用户凭 email + code 登录
```

- **公开注册入口已彻底关闭**（`disableSignUp: true` + Worker 层拦截 `/api/auth/sign-up`）
- 账号由管理员在飞书 Base「内部用户表」或「客户表」中维护
- Access Code 由管理员分配，类似一次性通行证

### 认证流程

```
浏览器 → /api/portal/session (POST) → Worker (portal.ts)
         → findLoginAccount()
           ├── 先查 lib/users.ts 本地存根（<5ms，开发/测试用）
           ├── 再查飞书 FEISHU_TABLE_INTERNAL_USERS（内部员工）
           └── 再查飞书 FEISHU_TABLE_CUSTOMERS（外部客户）
         → signSession() HMAC-SHA256 签名
         → Set-Cookie: youguard_portal=<signed-jwt>; HttpOnly; SameSite=Lax
```

### 会话安全

| 属性 | 值 |
|------|----|
| 签名算法 | HMAC-SHA256 |
| 有效期 | 12 小时 |
| Cookie 标志 | `HttpOnly; SameSite=Lax; Secure`（生产环境） |
| 注册阻断 | Worker 层 + better-auth `disableSignUp: true` 双重保障 |

---

## 环境变量

复制 `.dev.vars.example` 为 `.dev.vars` 并填写：

| 变量 | 必填 | 说明 |
|------|------|------|
| `FEISHU_APP_ID` | ✅ | 飞书开放平台应用 App ID |
| `FEISHU_APP_SECRET` | ✅ | 飞书开放平台应用密钥 |
| `FEISHU_BASE_APP_TOKEN` | ✅ | 飞书多维表格 App Token |
| `PORTAL_SESSION_SECRET` | ✅ | Session 签名密钥（≥32位随机字符串） |
| `FEISHU_TABLE_INTERNAL_USERS` | ❌ | 内部员工表 ID（留空则只用本地存根） |
| `FEISHU_TABLE_CUSTOMERS` | ❌ | 客户表 ID |
| `PORTAL_COOKIE_NAME` | ❌ | Cookie 名称，默认 `youguard_portal` |

> **注意**：生产环境通过 Cloudflare Workers 的 Secrets 管理，不要提交 `.dev.vars` 到 Git。

---

## 测试

```bash
# 单元 + 组件 + 集成测试（快速，<3s）
bun test

# E2E 浏览器测试（需要 dev server 启动）
bun run test:e2e

# 全部测试
bun run test:all
```

### E2E 测试账号配置

E2E 测试中使用 `partner@example.com` / `partner-demo-2026` 作为主要测试账号（外部视角，权限最具代表性）。

---

## 项目结构

```
├── app/portal/page.tsx     # 门户前端（单文件全量 SPA）
├── worker/portal.ts        # Cloudflare Worker 后端（API 路由 + 飞书集成）
├── lib/
│   ├── auth.ts             # Better Auth 服务端配置（disableSignUp: true）
│   ├── auth-client.ts      # Better Auth 客户端实例
│   └── users.ts            # 本地开发用户存根（4个测试账号）
├── tests/
│   ├── unit/               # 纯逻辑单元测试
│   ├── component/          # React 组件测试（happy-dom）
│   ├── integration/        # API 契约测试（MSW mock）
│   └── e2e/                # Playwright 真实浏览器测试
└── docs/
    └── feishu-cloudflare-portal.md  # 飞书+Cloudflare 架构详解
```

---

## 飞书 Base 表结构

| 环境变量 | 表用途 |
|----------|--------|
| `FEISHU_TABLE_INTERNAL_USERS` | 内部员工账号（admin/sales/sourcing/finance） |
| `FEISHU_TABLE_CUSTOMERS` | 外部客户账号（partner/customer） |
| `FEISHU_TABLE_VEHICLE_MODELS` | 车型规格库 |
| `FEISHU_TABLE_INQUIRIES` | 询价单 |
| `FEISHU_TABLE_QUOTES` | 报价单 |
| `FEISHU_TABLE_ORDERS` | 订单 |
| `FEISHU_TABLE_NEGOTIATIONS` | 议价记录 |

详细字段映射见 [`docs/feishu-cloudflare-portal.md`](docs/feishu-cloudflare-portal.md)。
