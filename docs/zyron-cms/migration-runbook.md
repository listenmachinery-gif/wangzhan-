# ZYRON CMS 数据迁移 Runbook

## 前置门禁

- 用户在独立轮次明确批准生产数据变更。
- 确认目标数据库身份、TLS/连接池、可恢复备份及恢复演练结果。
- 审阅 `prisma migrate status` 和待执行 SQL；迁移必须向后兼容，不含删表、删列、强制重置。
- 保留当前正常 Vercel Production Deployment。

## 执行顺序

1. 记录发布前 SHA、部署 ID、数据库时间点快照和目录计数。
2. `prisma migrate status`；只在结果与审核一致时运行 `prisma migrate deploy`。
3. 幂等执行 RBAC seed。
4. 对生产目标运行目录 dry-run（必须带脚本要求的显式生产授权开关），保存分类/产品/未映射报告。
5. 人工核对 8 个分类、53 个现有 slug 及代表产品参数/媒体后，才执行写入。
6. 执行目录验证和只读 SQL：状态计数、重复 slug、孤儿外键、发布记录的 `publishedAt`。
7. Preview 验收通过后再请求生产发布批准。

禁止 `prisma migrate reset`、`prisma db push --force-reset`、清表或用 seed 覆盖业务数据。

## 回滚

应用故障优先恢复旧 Vercel 部署。数据库采用向前兼容修复；若确认数据损坏，由数据库管理员使用发布前快照恢复。不得把应用回滚当作数据库恢复。
