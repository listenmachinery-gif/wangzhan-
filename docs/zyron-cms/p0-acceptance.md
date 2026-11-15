# ZYRON CMS P0 组合验收矩阵

P0 验收以一套隔离 PostgreSQL `_test` 数据库、一个本地 S3-compatible HTTP 合约服务和完整 Playwright 串行套件组合完成。任何一项失败都不算 P0 通过。

| 验收能力 | 自动化证据 |
|---|---|
| CLI 初始化、登录、Session、权限过滤 | `p0-acceptance.spec.ts`、`admin-auth.spec.ts` |
| S3-compatible put/sign/delete、媒体上传/搜索/预览/引用保护 | `s3-storage-contract.test.ts`、`admin-media.spec.ts` |
| 分类、产品模块、发布、原 URL | `p0-acceptance.spec.ts`、`admin-products.spec.ts`、`public-product-parity.spec.ts` |
| 型号与参数编辑/导入/前台表格 | `admin-specifications.spec.ts` |
| Banner 媒体、响应式预览、发布与首页 | `admin-banners.spec.ts` |
| 询盘先入库、SMTP 独立失败记录、CRM 分配/跟进/导出 RBAC | `lead-service.test.ts`、`admin-leads.spec.ts` |
| SEO 草稿/发布快照、Metadata/Canonical、sitemap/robots | `seo-service.test.ts`、`admin-seo.spec.ts` |
| 非敏感设置、用户角色、Session 撤销、最后 Super Admin、2FA 状态 | `settings-service.test.ts`、`user-admin.test.ts`、`p0-acceptance.spec.ts` |

标准命令：`npm test && npm run test:integration && npm run test:e2e && npm run verify:catalogue && npm run typecheck && npm run lint && npm run build`。

本矩阵只证明本地隔离环境行为。生产 PostgreSQL、R2、SMTP、管理员和域名仍须按生产 Runbook 获取授权并逐项验收，不能以本地结果冒充生产成功。
