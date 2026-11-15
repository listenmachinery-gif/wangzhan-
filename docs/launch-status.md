# ZYRON 生产上线状态

最后更新：2026-11-15（Asia/Shanghai）

## 当前判定

**B. 构建修复完成，但生产环境未就绪**

## Git 与部署

- 工作分支：`codex/fix-vercel-prisma-generate`
- 构建修复提交：`183e203`
- 生产基线提交：`6ef3702`
- 构建修复：已完成，构建前显式执行 `prisma generate`
- 手动 Preview：`dpl_J4TiML7JYXgVjL9crGGoKJijSKVz`，`READY`
- Git Preview：`dpl_Bzx74cR18mWgv3mfnUf5LHVexTSQ`，`READY`
- 正式域名：`https://www.zyroncnc.com`
- 当前正式域名仍由旧生产部署提供服务，未切换到 CMS 版本

## 功能状态

| 模块 | 状态 | 证据/备注 |
|---|---|---|
| 登录、Session、RBAC | 代码与本地测试完成 | 生产管理员未初始化 |
| 后台布局 | 完成 | 已有受保护 `/admin` 路由 |
| 分类、产品、型号参数 | 完成 | 本地 PostgreSQL 集成及 E2E 已通过 |
| Banner | 完成 | 首页发布流程已有测试 |
| 媒体库 | 代码完成 | 生产 R2 未配置 |
| 询盘可靠入库与 CRM | 代码与本地验收完成 | 先入库后通知、限流、分配、跟进、行级 RBAC 与安全导出已通过测试；待生产数据库和 SMTP 验收 |
| SEO 管理 | 代码与本地验收完成 | 数据库草稿/发布快照、产品/全局 RBAC、Metadata 覆盖、Canonical/OG/noindex、sitemap/robots、结构化数据及后台 UI/API 已通过测试；待生产数据库验收 |
| 统一产品详情模板 | 部分完成 | 标准渲染器已有，旧产品仍需逐个迁移和人工视觉确认 |
| SMTP | Vercel 已配置变量 | 尚未在授权收件人上做生产测试 |

## 生产基础设施

| 项目 | 状态 |
|---|---|
| PostgreSQL | 未创建或未连接到 Vercel 项目 |
| `DATABASE_URL` | Preview/Production 缺少 |
| `SESSION_SECRET` | Preview/Production 缺少 |
| Cloudflare R2 | 未授权、未配置 |
| 管理员 | 未初始化 |
| 数据库 Migration | 未对生产执行 |
| 产品数据导入 | 未对生产执行 |

## 当前阻塞

Preview 运行日志为 Prisma `P1001`，目标是代码为缺少 `DATABASE_URL` 设置的不可达占位地址 `127.0.0.1:1`。因此首页、产品页和 sitemap 在 CMS Preview 中返回 500；登录页可打开，未登录管理 API 返回 401。

## 最近验证

SEO 管理（Task 11）：

- 单元测试：20 个文件，138 项通过
- PostgreSQL 集成测试：32 个文件，201 项通过
- SEO Playwright：1/1 通过（登录 → 编辑草稿 → 发布 → 原产品 URL Metadata 生效）
- 类型检查、ESLint：通过
- Next.js 生产构建：通过；数据库驱动页面均为运行时动态渲染，不在构建阶段查询数据库
- 安全边界：产品路径权限从 URL 与真实产品关系推导；编辑已发布记录不会在再次发布前影响前台
- 独立代码复审：Ready Yes，无剩余阻断项

询盘 CRM（Task 10）：

- 单元测试：18 个文件，133 项通过
- PostgreSQL 集成测试：29 个文件，191 项通过
- 类型检查、ESLint：通过
- Next.js 生产构建：通过
- CRM Playwright：1/1 通过（公开提交 → Admin 分配 → Sales 跟进 → 授权导出）
- 独立代码复审：无剩余 Critical/Important

## 受保护的用户工作

以下文件仍只存在于原 `feature/zyron-cms` 工作区，禁止在本发布分支修改或提交：

- `data/small-electric-shear-page.ts`
- `scripts/verify-small-electric-shear-page.mjs`
- `public/products/shearing/small-electric/hero/desktop-v2.jpg`
- `public/products/shearing/small-electric/hero/tablet-v2.jpg`
- `public/products/shearing/small-electric/hero/mobile-v2.jpg`
