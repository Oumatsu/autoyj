# Youguard Portal

Youguard 汽车出口 B2B 门户平台。

**技术栈**：Next.js 16 (`vinext` 1.0+) + React 19 + Better Auth + Cloudflare Workers + Feishu Base  
**代码质量**：ESLint v9 Flat Config + Knip + Bun Test (160/160 PASS) + Playwright E2E  
**线上预览**：[https://autoyj.haipee.workers.dev](https://autoyj.haipee.workers.dev)

---

## 🚀 快速启动

```bash
# 1. 安装依赖 (使用 bun)
bun install

# 2. 配置环境变量（复制示例文件）
cp .dev.vars.example .dev.vars
# 填入飞书 App ID / App Secret / App Token 等配置

# 3. 启动本地开发服务
bun run dev
```

打开浏览器访问 `http://localhost:3000/portal` 即可加载门户登录与管理系统。

---

## 🔑 4 种身份预置账号

> **仅用于开发与测试。正式账号由管理员在系统预设管理。**

| 角色 | 邮箱 | Access Code | 权限范围 |
|------|------|-------------|----------|
| **Admin** | `admin@local.test` | `admin-demo-2026` | **全权限**：看板、车型库、车源库、询价单、订单、财务、客户、员工管理 |
| **Sales** | `sales@local.test` | `sales-demo-2026` | **销售视角**：车型库、询价单、订单、出口流程控制 |
| **Partner** | `partner@example.com` | `partner-demo-2026` | **合作商**：车辆资源库（合作价）、询价、订单、出口流程 |
| **Customer** | `customer@example.com` | `customer-demo-2026` | **普通客户**：车辆库存（隐藏敏感底价）、询价、订单 |

### 快捷登录方式
1. **快速填充按钮（推荐开发用）**：登录页底部直接点击角色按钮，自动填充凭证并提交。
2. **手动输入**：在邮箱栏填入邮箱，Access Code 栏填入通行密码登录。
3. **Dev Session API（仅限 localhost）**：
   ```bash
   curl -X POST http://localhost:3000/api/portal/dev-session \
     -H "Content-Type: application/json" \
     -d '{"role": "partner"}'
   ```

---

## 🛡️ 认证与安全架构 (Better Auth)

### 无注册模式（No-Registration Auth）
系统采用**严格无注册（禁止公开注册）**的认证设计：

```
Better Auth 托管安全引擎 ──(闭环)──> 本地/预设凭证仓 (localUserStore) ──> 7天 HMAC-SHA256 会话派发
```

* **彻底隔离注册**：在 `lib/auth.ts` 中通过 Better Auth 的 `emailAndPassword.disableSignUp: true` 强制禁用注册；Worker 层拦截全部 `/api/auth/sign-up` / `/register` 请求并返回 `HTTP 403 Forbidden`。
* **独立于飞书**：身份认证、密码/Access Code 校验、会话维持（Session Cookie）与权限计算**100% 由 Better Auth 引擎接管**，无需实时依赖飞书接口，登录校验 `<5ms` 瞬时完成。

### 会话配置

| 属性 | 参数规格 |
|------|----------|
| **认证框架** | Better Auth (`better-auth`) |
| **会话有效期** | 7 天 (`SESSION_TTL_7D` = 604800s) |
| **Token 自动刷新**| 每天刷新 (`SESSION_UPDATE_AGE_1D` = 86400s) |
| **Cookie 安全配置**| `youguard_portal` (HttpOnly, SameSite=Lax) |

---

## 🛠️ 代码质量与测试命令

```bash
# 运行单元测试、组件测试与集成契约测试 (160/160 PASS)
bun test

# 运行 ESLint 代码质量规范检查 (ESLint v9 Flat Config)
bun run lint

# 运行 Knip 死代码与无用依赖扫描
bun run knip

# 运行 Playwright E2E 浏览器自动化测试
bun run test:e2e

# 运行生产打包与 Cloudflare Workers 部署
bun run build
bun run deploy
```

---

## 📁 项目目录结构

```
├── app/                  # Next.js App Router 页面路由
│   ├── portal/page.tsx   # 门户后台管理单页应用 (SPA)
│   ├── layout.tsx        # 根布局与全局样式定义
│   └── page.tsx          # 官网首页
├── worker/
│   └── portal.ts         # Cloudflare Workers 后端逻辑（API 路由与飞书 Base 数据对接）
├── lib/
│   ├── auth.ts           # Better Auth 服务端官方配置 (disableSignUp: true)
│   ├── users.ts          # 预设用户身份与权限凭证仓
│   └── constants.ts      # 常量与 Cookie 统一标准定义
├── components/           # UI 组件与 shadcn/ui 基础部件
├── i18n/                 # 国际化配置 (zh / en / am) 与 Tolgee 绑定
├── tests/
│   ├── unit/             # 纯逻辑单元测试
│   ├── component/        # React 组件测试 (happy-dom)
│   ├── integration/      # API 契约与接口测试 (MSW mock)
│   └── e2e/              # Playwright E2E 真实浏览器测试
├── eslint.config.mjs     # ESLint v9 Flat Config 规范配置
└── knip.json             # Knip 死代码/无用导出扫描配置
```

---

## 📊 飞书 Base 多维表格数据映射

后端的车辆数据与信息查询对接飞书 Base 表格：

| 表用途 | 飞书 Table ID / View ID | 场景应用 |
|--------|------------------------|----------|
| **后台车型库** | `tblxVNjP9dnJ7b3o` (View: `vewppBx2ht`) | 品牌/车系规格 |
| **车型配置表** | `tbl8YzkZkMxvHRoT` (View: `vew1Se8rpJ`) | 详细参数与差异配置 |
| **车辆资源表** | `tblte61W3fKoXmSw` (View: `vewCyPzSbJ`) | 供应商库存与报价资源 |
| **询价单** | `tblEL6AHiMiWhkVj` | 客户询价线索 |
| **报价单** | `tblIY4WdBVqvkZf0` | 销售对外报价记录 |
| **订单管理** | `tblFxuRqSt2oAu0H` | 交易履约与交车追踪 |
