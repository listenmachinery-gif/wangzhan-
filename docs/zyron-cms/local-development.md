# ZYRON CMS 本地开发

1. 使用仓库锁文件执行 `npm ci`。
2. 创建相互独立的 PostgreSQL 开发库与测试库；测试库名称必须以 `_test` 结尾。
3. 从 `.env.example` 创建未跟踪的本地配置，填写本地 `DATABASE_URL`、`TEST_DATABASE_URL` 和随机 `SESSION_SECRET`。
4. 执行 `npm run db:generate`，再对开发/测试目标分别执行已审核 migration；禁止把测试连接指向生产。
5. 本地对象存储可用受控目录驱动；S3/R2 凭据不得用于单元测试。
6. 目录迁移先运行 `npm run import:catalogue -- --database=test --dry-run`，确认报告后才对测试库加 `--write --summary`。
7. 验证顺序：`npm run typecheck`、`npm run lint`、`npm test`、`npm run test:integration`、`npm run test:e2e`、`npm run verify:catalogue`、`npm run build`。

集成/E2E 会修改并清理测试库。项目的重置保护要求 `DATABASE_URL === TEST_DATABASE_URL` 且数据库名以 `_test` 结尾，否则拒绝执行。
