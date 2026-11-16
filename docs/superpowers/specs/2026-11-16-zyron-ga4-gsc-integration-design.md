# ZYRON CMS：Google Analytics 4 与 Search Console 集成设计

## 背景与意图

ZYRON CMS 当前后台首页只显示产品和询盘数据库统计；“Google Analytics 4”和“Google Search Console”是固定的未连接占位状态。公开站点尚未加载 Google Tag，也没有从 Google API 读取数据。用户尚未创建 GA4 媒体资源或 Search Console 资源。

本次升级要建立一套真实、只读、可诊断的 Google 数据集成：公开站点在访客同意后采集 GA4 数据，CMS 通过服务账号读取 GA4 与 Search Console 报表，后台展示外贸运营所需指标。所有私钥只进入 Vercel 服务端环境变量，不写入数据库、浏览器包、日志或 Git。

## 已确认方案

采用“单一 Google Cloud 服务账号 + Search Console 域名资源”方案：

- 为 `zyroncnc.com` 创建一个 GA4 媒体资源和 Web 数据流。
- 为 `zyroncnc.com` 创建 Search Console Domain Property，并用 DNS TXT 记录完成所有权验证。
- 在一个 Google Cloud 项目中启用 Google Analytics Data API 与 Search Console API，创建只用于报表读取的服务账号。
- 把服务账号授予 GA4 Viewer 权限，并授予 Search Console 资源的只读所需权限。
- 公网站点只暴露 GA4 Measurement ID；GA4 Property ID、服务账号邮箱和私钥只存在于服务端环境变量。
- CMS 使用 Google 官方身份认证库获取短期访问令牌，通过官方 REST API 读取报表，不保存或复制 Google 原始数据到业务数据库。

## 目标

- 在公开网站采集真实 GA4 页面浏览与关键询盘转化事件，不统计 `/admin` 与后台登录页。
- 在 CMS 中提供 GA4 和 Search Console 的 7、28、90 天报表。
- 后台首页展示真实连接状态、最近同步时间和明确错误；没有配置时绝不显示伪造数据。
- 数据读取失败不影响官网、产品页、询盘提交或后台其它模块。
- 严格区分公开标识符和服务端秘密，防止私钥进入客户端或 Git。
- 通过 Preview 验证采集、权限、API 和页面，再按现有 Vercel 流程发布生产。

## 非目标

- 不在 CMS 中修改 GA4、Search Console 或 Google Cloud 的账号、权限和资源设置。
- 不实现广告投放、Google Ads、Merchant Center、Tag Manager 或跨域追踪。
- 不导入历史 Google 数据到 PostgreSQL，也不建立定时数据仓库。
- 不承诺 Search Console 实时数据；页面必须标明 Google 数据延迟和统计口径。
- 不绕过 Google 登录、两步验证、DNS 所有权验证或人工授权。
- 不把服务账号 JSON 文件提交到仓库或上传媒体库。

## 方案比较

### 方案 A：服务账号 + Domain Property（采用）

服务账号适合单站点、服务器到服务器的只读报表；Domain Property 覆盖根域、`www`、协议和未来子域，避免 URL-prefix 资源遗漏。代价是首次配置需要 Google 账号操作和 DNS TXT 验证。

### 方案 B：服务账号 + URL-prefix Property

无需 Domain Property 的全域覆盖，但只覆盖一个精确协议与主机，例如 `https://www.zyroncnc.com/`。未来域名或协议变化容易产生数据分裂，因此不采用。

### 方案 C：管理员 OAuth 登录

允许每个后台用户用自己的 Google 身份授权，但需要 OAuth Consent Screen、回调、刷新令牌加密、撤销和多账号管理。对于目前单一企业站点复杂度过高，因此不采用。

## 用户体验

### 后台导航与权限

- 在后台主导航新增 `/admin/analytics`“数据分析”。
- 本阶段复用现有 `settings.write` 权限：`SUPER_ADMIN` 和 `ADMIN` 可查看报表及连接诊断，编辑、销售和普通内容角色不可查看。
- 不新增数据库权限记录或生产 Schema 迁移，避免仅为一个只读页面引入 RBAC 数据变更。

### 数据分析页

页面顶部提供 7 天、28 天、90 天三个日期范围，默认 28 天。日期范围写入查询参数，刷新和分享后台 URL 时保持选择。

GA4 区域显示：

- 活跃用户、会话、浏览量、参与率和关键事件总数。
- 与上一等长周期的变化百分比；上一周期无数据时显示“暂无可比数据”，不除以零。
- 每日趋势、热门页面、来源/媒介、国家或地区。
- 关键转化事件明细：`inquiry_start`、`inquiry_submit`、`whatsapp_click`、`email_click`、`catalog_download`。

顶部“关键事件总数”严格使用 GA4 的 `keyEvents` 指标，不把五个约定事件简单相加。目前只把 `inquiry_submit` 标记为 Key event，因此这个指标表达真实询盘转化；五个约定事件在下方分别展示原始事件次数，避免把浏览意向动作误称为转化。

Search Console 区域显示：

- 点击、展示、CTR、平均排名。
- 每日趋势、热门搜索词、热门落地页、设备和国家或地区。
- 明确说明近期数据可能尚未最终确认，且 Search Console API 只保证返回其可提供的顶部数据，而非完整关键词全集。

数据表在手机后台布局中可横向滚动；图表同时提供数值摘要，不能只靠颜色表达涨跌。空数据、未配置、无权限、配额限制和 Google 暂时错误必须分别显示。

### 日期与统计口径

- GA4 Property 创建时使用 `Asia/Shanghai` 报表时区；7、28、90 天均表示该时区内截至昨天的完整自然日，不包含尚未结束的今天。
- GA4 上一周期是当前周期前紧邻的同等天数，使用相同 Property 时区。
- Search Console API 的日期按其规定使用 Pacific Time；查询同样截至 Pacific Time 的昨天并使用最终数据，`dataThrough` 显示按日期查询实际返回的最新日期。Google 尚未最终确认的日期可能缺失，页面如实显示滞后。
- Search Console 上一周期使用相同来源、相同时区和同等天数。GA4 与 Search Console 分区独立比较，不制作会掩盖两者时区和延迟差异的跨来源合并环比。

### 后台首页

现有两个 `ConnectionStatus` 占位卡改为真实诊断：

- `未配置`：必要环境变量缺失。
- `配置不完整`：标识符存在但服务账号信息不完整。
- `无访问权限`：Google 返回 401/403。
- `已连接`：最近一次只读探测成功，并显示最近检查时间。
- `暂时不可用`：超时、配额或 5xx；保留官网和 CMS 其它功能。

卡片链接到 `/admin/analytics`，错误文案只显示安全的错误分类和操作建议，不显示令牌、私钥、完整 API 响应或堆栈。

## 公网站点采集

### 加载范围

- GA4 只挂载在 `app/(site)/layout.tsx`，不挂载在根布局或后台布局，因此 `/admin`、`/admin/login` 和管理 API 不被统计。
- 使用 Next.js 推荐的 Google Analytics 集成组件；Measurement ID 由 `NEXT_PUBLIC_GA4_MEASUREMENT_ID` 提供。
- 环境变量缺失时组件完全不渲染，网站保持正常。

### 隐私同意

采用严格的主动同意策略：首次访问显示简洁的英文 Analytics 偏好条，只有用户点击 Accept 后才加载 GA4；Reject 时不加载 Google Tag。选择保存在第一方偏好 Cookie 中，有效期 180 天，并提供页脚“Cookie preferences”入口供用户重新选择。

偏好 Cookie 只保存 `accepted` 或 `rejected`，不包含个人信息，使用 `Path=/`、`SameSite=Lax` 和生产环境 `Secure`。同意组件在浏览器 hydration 后读取 Cookie，不在服务端布局调用 `cookies()`，从而避免为了 Analytics 把整个公开站点强制变成动态渲染。拒绝或尚未选择时任何事件上报函数都必须安全地无操作。此设计以较少数据换取更清晰的隐私边界。

### 事件契约

- `page_view`：Google Tag 在同意后首次挂载时记录当前页；一个客户端路由跟踪器只记录后续 App Router 导航。GA4 数据流需关闭“基于浏览器历史事件的页面变化”自动检测，避免与应用路由跟踪重复；自动化测试验证初始加载和每次导航都恰好一次。
- `product_view`：产品详情页完成渲染，参数包含产品 ID、Slug、名称和分类；不包含访客表单数据。
- `inquiry_start`：访客首次聚焦询盘表单。
- `inquiry_submit`：真实询盘 API 成功接收后发送；失败、蜜罐或客户端校验失败不能计为成功。
- `whatsapp_click`：点击经校验的 WhatsApp 联系链接。
- `email_click`：点击站点联系邮箱链接。
- `catalog_download`：点击真实目录下载，参数只包含站内媒体 ID/文件名和产品上下文。

不得把姓名、邮箱、电话、WhatsApp 号码、公司名、询盘正文、Session ID 或数据库 Lead ID 发送到 GA4。事件名和参数由一个类型化客户端助手统一管理；GA 未加载时助手无操作。

GA4 后台需把 `inquiry_submit` 标记为 Key event。CMS 仍显示全部约定事件；尚无数据时显示 0 和采集说明。

## 服务端集成

### 环境变量

公开变量：

- `NEXT_PUBLIC_GA4_MEASUREMENT_ID`：格式为 `G-...`，会进入浏览器包。

仅服务端变量：

- `GOOGLE_ANALYTICS_PROPERTY_ID`：GA4 数字 Property ID，不是 Measurement ID。
- `GOOGLE_SEARCH_CONSOLE_SITE_URL`：固定为 `sc-domain:zyroncnc.com`。
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`：服务账号邮箱。
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`：PEM 私钥，Vercel 中保存；运行时只把转义的 `\\n` 转为换行。

`.env.example` 只增加变量名、占位格式和说明，不包含真实值。Vercel Preview 与 Production 分别配置；Preview 可使用同一只读报表账号读取生产报表，但公开采集默认关闭。需要真实验证 Preview 采集时使用单独的测试 GA4 Property 和数据流，不能只在正式 Property 中增加一个数据流，否则仍会污染该 Property 的汇总报表。没有测试 Property 时，Preview 不加载 GA Tag，但仍可验证服务端报表权限和 Mock 事件流程。

### Google 身份与 API

- 新增仅服务端的 Google 认证模块，使用官方 `google-auth-library` 和最小只读 Scope：Analytics read-only 与 Webmasters read-only。
- GA4 使用 Data API `properties/{propertyId}:runReport`，按所需维度和指标发出少量固定查询。
- Search Console 使用 `sites/{siteUrl}/searchAnalytics/query`，`siteUrl` 按路径规范编码。
- 每次请求设置合理超时；不做无限重试。只对网络错误、429 和 5xx 进行最多一次带抖动的短重试，401/403 不重试。
- 令牌由官方库在进程内管理；不写入数据库、缓存、Cookie 或响应。

### 服务与 API 边界

- `GoogleIntegrationConfig` 负责校验环境变量并返回安全状态。
- `GoogleAuthProvider` 负责生成只读授权客户端。
- `Ga4ReportingService` 和 `SearchConsoleReportingService` 各自把 Google 响应转换为内部稳定类型。
- `AnalyticsOverviewService` 并行读取两个来源；一个失败时保留另一个的成功结果。
- `/api/admin/analytics/overview?range=7d|28d|90d` 返回归一化报表和每个来源的状态。
- `/api/admin/analytics/status` 只执行轻量只读探测，供首页连接卡使用。
- 两个 API 均要求 `settings.write`，无 Session 返回 401，无权限返回 403，并沿用现有同源与错误响应约定。

服务端模块必须标记 `server-only`，不得从客户端组件导入。API 响应不包含配置原值、服务账号邮箱、Google 错误正文或授权 Header。

### 缓存与配额

- 按来源、日期范围和报表类型缓存成功结果 15 分钟，降低 Google API 配额和后台等待时间。
- 错误结果不进入长期缓存；同一错误可做最多 30 秒的短暂抑制，避免页面刷新风暴。
- 响应返回 `generatedAt` 与 `dataThrough`，后台显示“数据更新至”，不把缓存数据伪装成实时数据。
- 不增加 Cron、队列表或数据库同步任务。

## Google 资源创建与授权步骤

这些步骤必须由已登录且有权管理域名和 Google 资源的用户在 Google 控制台完成；Codex 不索取 Google 密码或两步验证码。

1. 在 Google Analytics 创建 ZYRON 账号或使用现有企业账号，创建 GA4 媒体资源、`https://www.zyroncnc.com` Web 数据流，记录 Measurement ID 与数字 Property ID。
2. 在 Google Search Console 添加 `zyroncnc.com` Domain Property，复制 Google 提供的 TXT 值。
3. 在当前 DNS 服务商为根域添加 TXT 记录，等待解析后在 Search Console 完成验证。只添加 Google 指定记录，不修改 A、AAAA、CNAME 或邮件记录。
4. 在 Google Cloud 创建专用项目，启用 Google Analytics Data API 与 Search Console API，创建专用服务账号和密钥。
5. 在 GA4 Property Access Management 中把服务账号加入 Viewer。
6. 在 Search Console 的 Users and permissions 中把服务账号加入该资源，优先授予 Restricted user（只读）权限；状态探测会验证 `searchAnalytics.query` 是否可用，只有 Google 实际拒绝读取时才提升为 Full user，不授予 Owner。
7. 把五个环境变量分别配置到 Vercel Preview/Production；私钥直接进入 Secret 输入，不写入本地受版本控制文件。
8. 先执行 CMS 状态探测，再创建 Preview 部署，确认 GA DebugView/Realtime、GA 报表 API 与 Search Console API；最后才发布 Production。

Google 资源刚创建时可能没有历史数据。连接成功且报表为空属于正常状态，不能误报为故障。Search Console 在网站产生搜索展示后才会逐步出现数据。

## 错误处理与可观察性

- 所有 Google 错误映射为内部错误码：`NOT_CONFIGURED`、`INVALID_CONFIG`、`UNAUTHORIZED`、`FORBIDDEN`、`RATE_LIMITED`、`TIMEOUT`、`UPSTREAM_UNAVAILABLE`、`NO_DATA`。
- 服务端日志只记录来源、内部错误码、HTTP 状态和请求追踪 ID；凭证、访问令牌和 Google 响应正文必须脱敏。
- 报表错误不能抛到整个后台页面；页面分别展示 GA4 与 GSC 的局部错误状态。
- 公开 GA 脚本加载失败不能阻断页面交互或询盘提交。

## 测试与验证

### 自动测试

- 配置解析：完整、缺失、私钥换行、非法 Measurement ID/Property ID/Site URL。
- 权限：未登录 401、无权限 403、管理员成功；API 不泄露配置。
- Google 客户端：成功转换、空数据、401/403、429、超时、5xx、一次重试和错误归类。
- 聚合服务：GA 成功/GSC 失败及反向情况仍返回局部结果；周期比较和零除保护正确。
- 采集助手：未同意时不加载/不发送，同意后发送允许事件，拒绝 PII 参数。
- 组件：日期范围、空状态、连接状态、移动端表格和 Cookie 偏好交互。
- E2E：后台受保护、连接未配置状态、配置 Mock 后的报表、公开站拒绝/接受后的脚本行为、询盘成功事件只发送一次。

### 本地与 Vercel 质量门

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- 使用独立测试数据库运行 `npm run test:integration`
- `npm run test:e2e`
- `npm run build`
- `vercel build` 或项目现有等价 Preview 构建

测试不得访问或修改生产数据库。Google 集成单元/集成测试使用本地 HTTP Mock；只有人工 Preview 验收读取真实 Google 报表。

## 发布与验收

1. 在功能分支完成代码和自动测试，不修改现有公开 URL、产品数据或品牌内容。
2. 配置 Preview 的非生产 Measurement ID 和只读服务端凭证；部署 Preview。
3. 验证首页、产品列表、至少一个产品详情、询盘提交、后台登录、`/admin/analytics`、未登录 API 401、静态资源和移动端布局。
4. 在 GA4 Realtime/DebugView 验证允许后的 `page_view`、`product_view` 和一次测试询盘事件；测试询盘必须标记并从 CRM 删除或归档，不冒充真实客户。
5. 验证 Search Console 连接；如果新资源暂无数据，使用权限探测成功和明确空状态作为验收依据。
6. 审查 Git diff，确认没有密钥、`.env.local`、服务账号 JSON 或构建产物。
7. 通过现有 Git/Vercel 流程发布生产；Production Measurement ID 使用正式数据流。
8. 生产发布 Ready 后检查 `https://www.zyroncnc.com`、产品页、后台登录、数据分析页和两个管理 API，并确认当前生产域名指向新部署。

## 完成标准

- 访客拒绝或未选择时不加载 GA；接受后公开页面产生真实 GA4 事件。
- 后台展示真实 GA4/GSC 数据或准确的未配置、无权限、空数据状态。
- 服务账号凭证只存在于 Vercel 服务端配置，没有进入 Git、HTML、客户端 JS、数据库或日志。
- 两个 Google 来源可以独立失败，不影响官网、询盘和后台其它功能。
- 全部现有检查、生产构建和 Preview 验收通过。
- Google 资源、DNS 验证和生产环境变量完成后，新生产部署为 Ready，核心路径验收通过。

## 留给实施者的工程选择

- 图表优先使用轻量、可访问的现有 CSS/SVG 组件；只有现有组件无法满足时才引入新图表依赖。
- Google API 的固定查询可用 REST 并复用官方身份库，不必引入体积较大的全套 `googleapis` SDK。
- Cookie 偏好组件的具体视觉细节沿用现有 ZYRON 黑、白、工业绿令牌，不改变官网主体布局。
