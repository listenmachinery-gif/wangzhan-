# ZYRON CMS 生产发布

## 分阶段上线

1. 冻结发布 SHA，确认工作树、依赖审计、完整测试与 `vercel build --prod`。
2. 配置 Preview 的 PostgreSQL、Session、R2 和 SMTP 变量；不在构建期执行 migration/seed/import。
3. 按 `migration-runbook.md` 在备份和明确授权后执行生产 migration、RBAC、目录 dry-run/导入。
4. 在 Preview 验收首页、产品列表/详情、后台登录、媒体、Banner、询盘/CRM、SEO、管理 API、robots/sitemap 和移动端。
5. 提交分支/SHA、Preview ID、风险与回滚方案，等待用户明确“批准生产发布”。
6. 优先通过仓库既有 GitHub→Vercel 流程发布；避免重复 CLI Production 部署。
7. 监控新部署为 Ready、域名指向新版本后执行生产只读冒烟；旧部署保留可回滚。

## 停止条件

数据库备份不可验证、环境变量缺失、Preview 非 Ready、核心流程失败、DNS 目标不明确或授权缺失时立即停止。不得切换域名，不得删除旧部署，不得以重复部署替代修复。

## 验收与证据

在 `docs/launch-status.md` 记录 SHA、部署 ID、测试结果、迁移/导入报告、批准时间和冒烟结果，不记录任何秘密。正常的管理 API 401/403 是安全验收通过，不是故障。
