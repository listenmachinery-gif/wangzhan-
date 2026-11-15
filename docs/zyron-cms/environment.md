# ZYRON CMS 环境变量

真实值只放在本地密钥文件或 Vercel 环境变量中，不写入 Git、工单或聊天。

## 核心运行时

| 变量 | 用途 | 范围 |
|---|---|---|
| `DATABASE_URL` | PostgreSQL 应用连接（建议连接池/TLS） | Development / Preview / Production |
| `TEST_DATABASE_URL` | 自动化测试专用 PostgreSQL；库名必须以 `_test` 结尾 | Test only |
| `SESSION_SECRET` | Session 摘要/安全用途，至少 32 个随机字节 | 每个环境独立 |
| `ZYRON_ENABLE_LEGACY_PRODUCT_FALLBACK` | 本地迁移验证时显式开启旧目录回退；生产 CMS 不开启 | Development only |

## 对象存储

`OBJECT_STORAGE_DRIVER`（`s3` 或本地测试驱动）、`OBJECT_STORAGE_ENDPOINT`、`OBJECT_STORAGE_REGION`、`OBJECT_STORAGE_BUCKET`、`OBJECT_STORAGE_ACCESS_KEY_ID`、`OBJECT_STORAGE_SECRET_ACCESS_KEY`。本地驱动另用 `OBJECT_STORAGE_LOCAL_DIR`。正式媒体公共域名由存储/代理配置提供，不在仓库保存凭据。

## 邮件与询盘

`SMTP_HOST`、`SMTP_PORT`、`SMTP_SECURE`、`SMTP_USER`、`SMTP_PASS`、`SMTP_FROM`、`INQUIRY_TO_EMAIL`。生产测试只能发往已授权收件人。

## 一次性管理员初始化

`BOOTSTRAP_ADMIN_EMAIL`、`BOOTSTRAP_ADMIN_NAME`、`BOOTSTRAP_ADMIN_PASSWORD`。生产还要求一次性 `ALLOW_PRODUCTION_BOOTSTRAP=true` 和 `ZYRON_PRODUCTION_CHANGE_AUTHORIZED=true`；成功后立即删除一次性密码/授权变量。

`NODE_ENV`、`CI` 由运行平台设置。任何新增变量都必须同步更新 `.env.example` 和本文档。
