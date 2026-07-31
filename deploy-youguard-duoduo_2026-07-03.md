# 部署 youguard-duoduo 独立 Worker 项目

**时间**: 2026-07-03 10:26-10:31 CST  
**目标**: 用当前 `duoduo/merge` 分支代码部署一个新 Cloudflare Worker，不覆盖 `main` 分支 CI/CD 自动部署的 `youguard` 项目

## 操作步骤

1. **检查分支 & 登录状态** — 当前在 `duoduo/merge` 分支，CF 账户 `2357325704@qq.com` 已登录
2. **构建** — `npm run build` (`vinext build`) 成功，产出 `dist/client/` (静态资源) + `dist/server/` (Worker bundle，含 `index.js` + 构建产物自带 `wrangler.json`)
3. **部署策略** — vinext 构建产物不能直接用 `wrangler deploy --name xxx`（`--no-bundle` 与参数解析冲突）。解决方案：
   - 修改 `dist/server/wrangler.json` 中的 `name` 为 `youguard-duoduo`
   - 删除临时缓存 `.wrangler/deploy/config.json`（否则 wrangler 指向不存在的配置路径）
   - 在 `dist/server/` 目录下执行 `wrangler deploy --config wrangler.json`
4. **恢复** — `.wrangler/deploy/config.json` 和 `dist/server/wrangler.json` 都恢复为原始内容（`name: youguard`），确保下次 `vinext build` + 主分支部署不被污染

## 结果

| 项目名 | 域名 | 分支 | 备注 |
|--------|------|------|------|
| `youguard` | 原有域名 | `main` (CI/CD) | 不受影响 |
| `youguard-duoduo` | `https://youguard-duoduo.2357325704.workers.dev` | `duoduo/merge` | 新部署 |

**当前 Version ID**: `a5cee5f7-50d0-4fd7-81e2-f4f00236b51f`
**注意**: 新部署访问的数据库仍然是同样的飞书多维表格（环境变量未修改），如需指向测试数据库，需在 Cloudflare Dashboard 中为 `youguard-duoduo` 设置不同的环境变量。
