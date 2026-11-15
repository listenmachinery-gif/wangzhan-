# ZYRON 生产上线 Runbook

## 原则

- 保留现有正式部署，直到新 Preview 的构建和运行验收全部通过。
- 不修改现有产品 URL、slug、canonical、品牌或产品数据。
- 所有数据库变更先备份、审核、批准，再执行增量 migration。
- GitHub/Vercel/数据库/R2/SMTP 秘密只存放在平台密钥管理中。
- 每个阶段使用独立提交，可通过应用部署回滚；数据库 Schema 必须向后兼容。

## 阶段门禁

1. 构建：`npm ci`、Prisma Client 生成、类型、Lint、单元/集成/E2E、`next build`、`vercel build --prod`。
2. Preview：状态 `READY`，首页、产品列表、代表产品、登录页、管理 API、robots、sitemap、静态资源通过。
3. 基础设施：生产 PostgreSQL、`SESSION_SECRET`、R2、SMTP 已配置并验证。
4. 数据：备份完成，migration 已审核，RBAC/目录导入 dry-run 报告通过。
5. 管理员：一次性初始化、登录/退出/限流/RBAC 通过，临时凭据已清除。
6. 业务：询盘入库优先于邮件；CRM、SEO、媒体和产品发布通过真实 Preview 验收。
7. 发布：用户明确批准后，按 GitHub→Vercel 现有自动部署流程合并/推送 `main`，不重复运行独立生产部署。
8. 生产冒烟：正式域名、核心页面、后台、API、媒体、邮件、SSL、移动端和原 URL 全部核验。

## 回滚

- 应用故障：恢复到发布前已验证的 Vercel Production Deployment。
- 不删除失败部署，保留日志和 ID。
- 数据库 migration 必须向后兼容；若发生数据问题，使用发布前快照恢复，不以应用回滚替代数据恢复。
- 媒体对象删除采用引用保护与延迟清理，避免回滚应用时资源缺失。

## 证据记录

每次发布在 `docs/launch-status.md` 记录：分支、SHA、部署 ID、测试命令、状态、数据库操作、人工批准和验收结果。不得记录秘密值。

