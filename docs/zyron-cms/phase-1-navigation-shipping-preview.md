# ZYRON 升级 Phase 1 Preview 验收记录

验收日期：2026-11-17（Asia/Shanghai）

## 本阶段范围

- 全站导航改为真实数据库驱动，支持草稿、发布、版本历史与回滚。
- 新增 Shipping Highlights（发货集锦）后台管理、前台列表、详情和首页联动。
- 保留现有产品 URL、`/cases`、询盘、CRM、聊天、分析、SEO 与数据库业务数据。
- 本次只发布 Preview，不修改当前生产域名或生产数据库。

## Preview 部署

- 部署状态：Ready
- 部署 ID：`dpl_Cu1rAqT11FePDRGvb3ejoj4GhQeZ`
- Preview 地址：<https://wangzhan-b5t72blqs-listenmachinery-gifs-projects.vercel.app>
- Vercel 检查页：<https://vercel.com/listenmachinery-gifs-projects/wangzhan/Cu1rAqT11FePDRGvb3ejoj4GhQeZ>
- 验证代码提交：`b96341d`

首次预构建部署因产物错误记录本地 `.env.local` 路径而失败。修复方式是从 Vercel 构建上下文中排除本地环境文件后重新生成预构建产物；未上传、提交或输出任何本地密钥。失败部署未删除，当前成功部署为上述新部署。

## 数据库与权限

- 仅对 Vercel Preview 独立数据库执行了前向迁移 `20261117170000_navigation_shipping_highlights`。
- Preview RBAC 初始化脚本已幂等执行，新导航和发货权限已生效。
- Production 数据库未迁移、未写入、未重置，生产数据未变更。
- 管理员账号与密码未修改，也未写入本记录。

## 自动化验证

| 检查项 | 结果 |
| --- | --- |
| Prisma Schema 校验 | 通过 |
| Prisma Client 生成 | 通过 |
| TypeScript | 通过 |
| ESLint | 通过 |
| 单元测试 | 92 个测试文件、587 项测试全部通过 |
| 集成测试 | 128 个测试文件、805 项测试全部通过 |
| Playwright 端到端测试 | 32 项全部通过 |
| Next.js 生产构建 | 通过 |
| Vercel 原生 Preview 构建 | 通过 |

生产构建另使用无效本地数据库连接进行验证，仍可成功完成，确认构建流程不会连接或修改生产数据库。

## Preview 在线验收

| 路径 | HTTP 结果 | 验收结论 |
| --- | ---: | --- |
| `/` | 200 | 首页正常 |
| `/products` | 200 | 产品列表正常 |
| `/products/compact-electric-shearing-machine` | 200 | 现有产品详情 URL 正常 |
| `/shipping-highlights` | 200 | 发货集锦列表正常 |
| `/cases` | 200 | 旧案例路径继续可用 |
| `/news` | 200 | 新闻页正常 |
| `/admin/login` | 200 | 后台登录页正常 |
| `/api/admin/navigation` | 401 | 未登录访问按设计拒绝 |
| `/api/admin/shipping-highlights` | 401 | 未登录访问按设计拒绝 |

后台导航编辑、保存、发布、历史、回滚，以及发货集锦创建、编辑、媒体、发布与前台读取，已在本地真实测试数据库和生产模式服务器中通过自动化验收。Preview 管理员密码未被读取或重置，因此在线验收未绕过登录验证。

## 已知非阻塞提示

- Next.js 检测到主仓库与隔离工作区存在多个锁文件，提示可进一步配置输出追踪根目录；不影响本次构建和部署。
- `pg` 的上游弃用提示和 `react-simple-maps` 缺少 source map 提示不影响运行。
- Preview 当前若没有已发布发货记录，会显示真实空状态，不生成演示数据。

## 生产发布前置步骤

以下操作尚未执行，必须获得明确的生产发布批准后才可继续：

1. 将已验证分支按仓库现有流程合并到 `main`。
2. 仅对 Production 数据库执行同一前向迁移，并幂等更新 RBAC；禁止重置、强推或清空数据。
3. 触发 Production 部署并等待状态 Ready。
4. 验收生产首页、产品列表与详情、发货集锦、后台登录、管理 API、静态资源和移动端。
5. 确认 `www.zyroncnc.com` 指向新部署后，再关闭本阶段。
