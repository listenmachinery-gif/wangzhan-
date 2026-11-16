# ZYRON GA4 与 Search Console 上线运行手册

本手册用于 `zyroncnc.com` 的 Google Analytics 4（GA4）采集和 CMS 只读报表接入。所有操作都应在企业拥有的 Google、DNS 与 Vercel 账号中完成。不要把服务账号 JSON、私钥、环境变量导出文件或访问令牌保存到 Git、CMS 数据库、工单或聊天记录。

## 1. 资源与权限模型

### GA4 正式资源

1. 在企业 Google Analytics 账号中新建 GA4 Property，名称明确标注 Production。
2. 报表时区选择 `Asia/Shanghai`，货币按企业财务口径选择。
3. 新建 Web 数据流，网站 URL 为 `https://www.zyroncnc.com`。
4. 记录 Web 数据流的 Measurement ID（`G-...`）和 Property 的纯数字 ID；二者不可混用。
5. 在 Web 数据流的增强型衡量设置中关闭“基于浏览器历史事件的页面变化”自动检测。网站已自行跟踪 App Router 导航，开启该项会重复计算 `page_view`。
6. 在 GA4 的 Key events 管理中把 `inquiry_submit` 标记为 Key event。`inquiry_start`、联系方式点击和下载只是意向行为，不应标成真实询盘转化。

Preview 默认不采集。如果确需验证 Preview 的真实采集，必须创建独立的测试 Property 和 Web 数据流；不能把 Preview 数据流加到正式 Property。测试完成后保留或停用测试数据流，不把测试 Measurement ID 配到 Production。

### Search Console 正式资源

1. 新建 Domain Property：`zyroncnc.com`，不要选择 URL-prefix Property。
2. 复制 Google 当次生成的 DNS TXT 验证值。
3. 在修改前确认权威 DNS 提供商与 `zyroncnc.com` 的准确 zone。
4. 只新增该 TXT；不得修改 A、AAAA、CNAME、MX 或其他 TXT。
5. 等待权威 DNS 可查询到 TXT 后，在 Search Console 完成验证。验证成功后保留 TXT，除非 Google 明确允许移除。

### Google Cloud 与服务账号

1. 在企业 Google Cloud 组织中新建专用项目，例如 `zyron-reporting-production`。
2. 启用 Google Analytics Data API 和 Search Console API。
3. 新建专用服务账号，不创建用户 OAuth 凭据，不授予 Cloud 项目 Owner/Editor。
4. 为服务账号创建一把密钥，只把私钥写入 Vercel Secret；下载的 JSON 完成录入后应从本地安全删除。
5. 在 GA4 Property Access Management 中把服务账号加入为 Viewer。
6. 在 Search Console Domain Property 中先授予 Restricted 用户权限。只有实际只读查询返回权限不足、且 Restricted 权限无法读取所需 Performance 数据时，才升级为 Full；记录升级原因。

## 2. Vercel 环境变量

集成只使用以下五个变量：

| 变量 | 可见性 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | 浏览器公开 | Web 数据流 Measurement ID，格式 `G-...` |
| `GOOGLE_ANALYTICS_PROPERTY_ID` | 仅服务端 | GA4 纯数字 Property ID |
| `GOOGLE_SEARCH_CONSOLE_SITE_URL` | 仅服务端 | 固定为 `sc-domain:zyroncnc.com` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | 仅服务端 | 专用服务账号邮箱 |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | 仅服务端 Secret | PEM 私钥，可保留字面量 `\n` |

作用域规则：

- Production：配置全部五项，Measurement ID 必须属于正式 Property。
- Preview：配置四个服务端只读变量；默认不配置 `NEXT_PUBLIC_GA4_MEASUREMENT_ID`。
- 只有存在独立测试 Property 时，Preview 才配置其测试 Measurement ID。
- Development/Test：不得复用生产私钥。E2E 使用无真实数据的测试 Measurement ID 并拦截 Google 请求。
- 每次修改环境变量都会要求重新部署；不要用 `vercel env pull` 把值写进仓库目录。

安全核对只检查名称和作用域，例如 `vercel env ls`。任何终端截图、日志或最终报告都不得出现变量值。

## 3. 发布前验证

在隔离的测试数据库环境执行：

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run test:e2e
npm run build
git diff --check
```

构建脚本只执行 Prisma Client 生成和 Next.js 构建，不应运行 migration、seed、目录导入或写入 Google。随后检查：

```bash
git status --short
git grep -n -I -E 'BEGIN PRIVATE KEY|private_key_id|client_x509_cert_url' -- . ':!package-lock.json'
```

预期没有私钥、服务账号 JSON、`.env*`、`.vercel`、`.next` 或 Playwright 产物进入暂存区。

## 4. Preview 流程

1. 用现有项目关联拉取 Preview 配置并本地执行真实 Vercel 构建。
2. 创建 Preview 部署，等待状态为 Ready；失败时读取第一条 Build Log 根因，不重复盲目部署。
3. 验收首页、产品列表、一个数据库产品详情、联系/询盘、`/admin/login`、登录后的 `/admin/analytics`、移动端和静态资源。
4. 未登录访问 `/api/admin/analytics/overview?range=28d` 应返回 401；无 `settings.write` 权限应返回 403。
5. Preview 未配置采集 ID 时，不应请求 `googletagmanager.com`，但 CMS 可使用服务账号验证 GA4/GSC 只读权限。
6. 新 Property 没有数据是正常状态，前提是权限探测成功且 CMS 显示“已连接，所选日期暂无数据”，而不是“无访问权限”。

## 5. 正式发布与验收

1. 冻结已通过质量门禁和代码审查的提交 SHA。
2. 优先使用仓库既有 GitHub → Vercel 自动部署，避免同时运行 CLI Production 部署。
3. 等待生产部署 Ready 且 `www.zyroncnc.com` 指向新版本；保留旧生产部署供即时回滚。
4. 首次访问公开站点时，在选择前确认没有 Google Tag 请求；点击 Reject 后再次导航仍不得加载。
5. 重新打开页脚 Cookie preferences 并点击 Accept，确认只加载正式 Measurement ID。
6. 在 GA4 Realtime/DebugView 验证一次 `page_view`、一次数据库产品的 `product_view` 和一条明确标注的测试询盘 `inquiry_submit`。测试询盘随后从 CRM 删除或归档，不冒充真实客户。
7. 确认 `/admin`、`/admin/login` 和管理 API 不加载 Google Tag。
8. 登录管理员后台，检查 7/28/90 天切换、GA4/GSC 各自的数据更新时间和局部错误状态。
9. 在 Search Console URL Inspection/Performance 中确认 Domain Property 可用；Performance 数据通常有 2–3 天延迟。

## 6. CMS 状态含义

| 状态 | 含义 | 处置 |
|---|---|---|
| 已连接 | 权限探测成功 | 等待数据或正常使用 |
| 已连接，所选日期暂无数据 | 资源与权限正常，但日期范围无数据 | 检查新资源延迟、日期范围和正式采集是否开启 |
| 尚未配置 | 至少一个必要变量缺失 | 核对变量名称、环境作用域并重新部署 |
| 配置无效/配置不完整 | ID、邮箱或私钥格式无效 | 重新从受控来源录入，不在日志中打印原值 |
| Google 身份认证失败 | 服务账号或私钥无效/已撤销 | 轮换密钥并更新 Vercel |
| Google 资源访问权限不足 | 身份有效但未获资源权限 | 核对 GA Viewer 与 GSC Restricted/Full 权限 |
| 请求频率受限/超时/暂时不可用 | Google 暂时错误或网络问题 | 保留上次成功缓存，稍后重试；不要清缓存反复部署 |

CMS 只显示安全诊断，不显示 Google 原始响应、令牌、私钥或请求正文。GA4 与 Search Console 失败互不阻断。

## 7. 隐私与数据边界

- GA4 只在访客主动接受后加载，同意 Cookie 有效 180 天，可从页脚重新选择。
- 不向 GA4 发送姓名、邮箱、电话/WhatsApp、公司、询盘正文、Session ID 或 Lead ID。
- `inquiry_submit` 只在真实 API 成功且本地蜜罐为空时发送；邮件回退和失败响应不计转化。
- GA4 只挂载在公开站点 layout，后台和登录页始终排除。
- 上线前由业务负责人确认隐私政策已说明 Analytics Cookie、用途、保存期和重新选择方式。

## 8. 回滚与密钥轮换

代码或页面故障时，把生产域名回滚到上一个 Ready 部署；不要删除失败部署或旧部署，先保留日志证据。仅需停止采集时，可移除 Production 的 `NEXT_PUBLIC_GA4_MEASUREMENT_ID` 并重新部署；服务端只读报表可继续工作。

DNS 验证异常时只回滚本次新增的 Google TXT，前提是已确认该 TXT 是本次变更且业务负责人批准；不得触碰网站、邮件或其他验证记录。

服务账号密钥轮换步骤：

1. 新建第二把密钥。
2. 在 Vercel Preview 更新私钥并重新部署，确认 GA4/GSC 均已连接。
3. 更新 Production，部署并验收。
4. 在 Google Cloud 撤销旧密钥。
5. 再次验证 CMS 状态；记录轮换日期和操作者，不记录密钥内容。

任何数据库迁移、生产 Schema 变更、DNS 非 TXT 变更或权限扩大都必须单独获得明确授权。
