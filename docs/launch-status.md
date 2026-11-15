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
- 最新 Git Preview：`dpl_Fw3Xx7JtBaeef1XpsotUKstUr1Gd`（提交 `01a6673`），构建 `READY`；因生产级数据库变量未配置，首页/产品页运行时返回 500
- 产品模板/安全修复 Preview：`dpl_GVdaufg1JTBCQgV9bNvmrdjwhXsE`（提交 `202293f`），构建 `READY`；登录页 200、未登录管理 API 401、robots 200，首页/产品页/sitemap 因同一数据库阻塞返回 500
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
| 系统设置与用户安全 | 代码与本地验收完成 | 非敏感设置白名单/原子保存、用户角色/停用/Session 撤销、最后 Super Admin 并发保护、2FA 未配置状态、双门禁 bootstrap 与运维文档已通过测试 |
| 统一产品详情模板 | 兼容迁移完成、视觉待确认 | 53 个产品保持原 URL；标准渲染器按固定九区块组织，旧组件继续保留；产品公开页/参数 E2E 5/5 通过，逐页视觉确认前不删除旧组件 |
| 依赖安全 | 完成 | Nodemailer 升级并对 PostCSS/brace-expansion/minimatch 使用兼容安全覆盖；`npm audit --omit=dev` 与全量 `npm audit` 均为 0 |
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

Preview 运行日志为 Prisma `P1001`，目标是代码为缺少 `DATABASE_URL` 设置的不可达占位地址 `127.0.0.1:1`。因此最新 CMS Preview 首页和产品页返回 500；登录页返回 200，未登录管理 API 按设计返回 401。正式域名仍是旧版本：首页及产品页 200，CMS 登录页和管理 API 为 404。

## 最近验证

产品详情统一与依赖安全（Task 20-22）：

- 标准模板：24 类 CMS 底层模块无损分组到固定九区块，隐藏空区块，保留后台模块选择器和移动端参数横向滚动
- 迁移盘点：8 个分类、53 个产品；1,272 个模块，470 个待核字段，0 歧义、0 跳过；旧 URL、新 URL、文案/图片/参数数量、SEO 来源、旧/新渲染器和状态已记录
- 单元测试：20 个文件，140 项通过
- PostgreSQL/S3-compatible 集成测试：35 个文件，212 项通过
- 产品公开页与后台参数 Playwright：5/5 通过
- 干净依赖安装：`npm ci` 通过；全量与生产依赖审计均为 0
- 类型检查、ESLint、Next.js 生产构建：通过
- Vercel 失败部署首条真实错误已复核：提交 `6ef3702` 未生成 Prisma Client，导致 `app/(site)/products/series/[id]/page.tsx:70` 的回调参数退化为隐式 `any`；当前 Preview 构建日志已确认 `prisma generate` 后构建成功

P0 基础验收（Task 12）：

- 单元测试：20 个文件，138 项通过
- PostgreSQL/S3-compatible 集成测试：35 个文件，210 项通过
- Playwright 完整套件：12/12 通过（含真实 bootstrap、分类、产品、参数、Banner、媒体、询盘 CRM、SEO、设置/用户与公开 URL）
- 目录校验：8 个分类、53 个产品 slug 一致
- 类型检查、ESLint、Next.js 生产构建：通过
- 独立代码复审：Ready Yes，无剩余 Critical/Important

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
