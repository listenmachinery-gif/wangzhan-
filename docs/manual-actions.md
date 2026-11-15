# ZYRON 上线人工操作清单

本文档只记录变量名称、授权步骤和验证方法，不记录任何密码、Token、数据库连接串或对象存储密钥。

## 1. 生产 PostgreSQL（阻塞生产 Preview 验收）

当前状态：Vercel 团队 `listenmachinery-gifs-projects` 的 `wangzhan` 项目没有已连接的存储资源，也没有 `DATABASE_URL`。

需要人工决定：使用现有生产 PostgreSQL，或批准创建新的托管 PostgreSQL。生产库必须独立于开发/测试库，启用 TLS、备份和适合 Serverless 的连接池。

完成后在 Vercel 的 Preview 与 Production 环境配置：

- `DATABASE_URL`

安全提醒：不要将连接字符串发送到聊天、GitHub Issue、构建日志或代码仓库。

验证：`vercel env ls preview` 与 `vercel env ls production` 能看到变量名称；随后 Preview 首页和产品页不再出现 Prisma `P1001`。

## 2. Session 密钥

需要明确授权后生成密码学安全随机密钥，并在 Preview 与 Production 配置：

- `SESSION_SECRET`

安全提醒：不要使用 `.env.example` 示例值，不要发送到聊天。

验证：后台登录创建不透明 Session Cookie，退出后 Session 失效，未登录管理 API 返回 401/403。

## 3. 生产 Migration、RBAC 与目录导入

执行前需要：生产数据库身份确认、备份/快照、迁移 SQL 审核，以及用户对生产数据变更的明确批准。

批准后按顺序执行只增量、不重置的命令：

1. `prisma migrate status`
2. `prisma migrate deploy`
3. RBAC 幂等初始化
4. 产品目录 dry-run
5. 核对报告后执行带生产授权开关的目录写入
6. 运行目录验证

禁止：`prisma migrate reset`、`prisma db push --force-reset`。

## 4. 管理员初始化

用户需在受控终端或密钥管理界面设置：

- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_NAME`
- `BOOTSTRAP_ADMIN_PASSWORD`
- 一次性 `ALLOW_PRODUCTION_BOOTSTRAP=true`

安全提醒：密码不得发送到聊天。初始化成功后删除临时密码变量并重新部署/轮换相关秘密。

## 5. Cloudflare R2

需要用户登录 Cloudflare、开通 R2，并批准可能产生的费用。建议 Bucket：`zyron-cms-production`，正式公共媒体域名：`media.zyroncnc.com`。

需安全配置到 Vercel：

- `OBJECT_STORAGE_ENDPOINT`
- `OBJECT_STORAGE_REGION=auto`
- `OBJECT_STORAGE_BUCKET`
- `OBJECT_STORAGE_ACCESS_KEY_ID`
- `OBJECT_STORAGE_SECRET_ACCESS_KEY`
- `OBJECT_STORAGE_PUBLIC_BASE_URL`

不得把 Access Key/Secret 发到聊天，不得把 `r2.dev` 作为正式媒体域名。

## 6. SMTP 验收

Vercel 已存在 SMTP 变量名称。正式测试邮件只能发送到用户明确授权的收件人；需确认 SPF、DKIM、DMARC 和应用密码状态。

## 7. 产品页面视觉确认

每个旧产品迁移到统一模板后，需要用户检查桌面、平板、手机截图，确认文案、图片、参数、SEO 和询盘入口。确认前不删除旧组件。

## 8. 正式发布

生产发布前需单独输出分支、SHA、Preview、数据库变更、风险和回滚方案，并等待明确“批准生产发布”。

