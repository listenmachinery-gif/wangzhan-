# ZYRON 数据分析、访客 CRM、实时聊天与后台视觉升级设计

**日期：** 2026-11-16  
**状态：** 已确认  
**实施分支：** `codex/cms-2-phase1`

## 1. 目标与边界

在现有 ZYRON 官网、CMS、认证、RBAC、询盘 CRM、GA4 和 Google Search Console 集成上增量建设：

1. 第一方访客、会话、浏览轨迹和实时在线统计；
2. 可筛选、可导出并能查看完整时间线的访客分析后台；
3. 官网匿名实时聊天与后台多坐席工作台；
4. 访客、聊天、询盘和销售分配之间的可追踪关联；
5. 适合工业设备外贸业务的高端 B2B SaaS 后台视觉系统；
6. 在不伪造数据、不改变原有 URL、不破坏现有官网和 CMS 功能的前提下分阶段上线。

本项目不把 GA4/GSC 聚合数据归属到个人；官网当前没有真实站内搜索，因此首期不生成搜索词数据。`SiteSearchEvent` 只作为未来真实搜索功能接入时的保留接口，不出现在当前报表中。

## 2. 现状审查结论

- 技术栈为 Next.js 15、React 19、TypeScript、Tailwind CSS、Prisma 7、PostgreSQL、npm 和 Vercel。
- 现有管理员认证使用 HttpOnly/Secure/SameSite=Lax 数据库 Session，已有同源写请求保护与 RBAC。
- 现有 `Lead`、`LeadActivity`、`LeadAssignment` 和通知记录可以复用；匿名聊天不会在联系方式不足时伪造 `Lead`。
- 现有 GA4/GSC 为聚合报表，继续作为“外部渠道与搜索表现”数据源；第一方访客数据单独展示。
- 现有后台功能完整但视觉语言分散，侧栏、顶栏、表格、状态和空页面缺少统一系统。
- 现有数据库没有访客、会话、页面浏览、第一方事件、聊天或日汇总模型。

## 3. 已确认架构

### 3.1 数据职责

| 层 | 职责 | 技术 |
|---|---|---|
| PostgreSQL | 访客、会话、浏览、事件、聊天、分配、CRM 关联、日报持久化 | 现有 Neon/PostgreSQL + Prisma |
| Redis | 在线状态、心跳 TTL、WebSocket 多实例发布订阅、去重和速率限制 | Upstash Redis |
| WebSocket | 双向聊天、输入状态、已读状态、在线状态推送 | Vercel Functions 原生 WebSocket |
| HTTP API | 事件接收、历史同步、消息落库、筛选、导出和断线补偿 | Next.js Route Handlers |
| GA4/GSC | 聚合访问与搜索表现 | 现有 Google 集成 |

Vercel WebSocket 目前为 Public Beta。连接固定在接收它的函数实例，并在函数达到最大时长时关闭；客户端必须自动重连，实例间状态必须放在 Redis。Next.js 端使用 `@vercel/functions` 的 WebSocket 升级接口。实现保留 `REALTIME_ENABLED` 开关，关闭时聊天历史和消息提交仍可通过 HTTP 工作，但不进行高频数据库轮询。

### 3.2 请求流

```text
浏览器
  ├─ /api/analytics/collect ──> 校验、同意状态、幂等 ──> PostgreSQL
  │                                      └────────────> Redis 在线 TTL
  ├─ /api/chat/* ────────────> 鉴权、落库、CRM 关联 ──> PostgreSQL
  └─ /api/realtime ──────────> Vercel WebSocket <────> Upstash Redis Pub/Sub
                                                   └──> 其他函数实例/管理员
```

消息必须先成功持久化或以幂等键确认已存在，之后才能广播。Redis 只保存短期状态，不作为聊天记录的唯一来源。

## 4. 身份、会话与在线规则

### 4.1 匿名身份

- `zyron_vid`：服务端生成的随机匿名访客标识，签名、HttpOnly、Secure、SameSite=Lax；不包含邮箱、IP 等个人信息。
- `zyron_sid`：当前访问会话标识，同样由服务端签名；30 分钟无活动后由接收端创建新会话。
- 每个页面实例使用浏览器生成的 `pageViewId`；每个事件使用 `eventId`，服务端唯一约束保证重试不重复计数。
- 聊天 WebSocket 不直接信任 Cookie 中的明文 ID；由 `/api/chat/token` 颁发短时、限定访客与会话范围的签名令牌。

### 4.2 心跳与多标签页

- 页面首次可见时记录 page view。
- 页面可见且用户近期有活动时每 30 秒发送心跳。
- `BroadcastChannel` 负责同一浏览器会话的标签页协调；每个页面浏览仍独立计时，但访客在线状态只更新一次。
- “在线”定义为 `lastSeenAt` 距当前不超过 120 秒。
- “活跃”定义为 `lastActiveAt` 距当前不超过 5 分钟。
- `visibilitychange`、`pagehide` 和重连用于补齐退出时间；服务端对异常关闭设置上限，避免无限活跃时长。

### 4.3 来源与设备

- UTM、首次来源和最近来源分别保存；直接访问不会覆盖已有首次来源。
- 国家/地区优先读取 Vercel 可信请求头；不调用不透明的第三方 IP 数据服务。
- 不保存原始 IP。需要反滥用时只保存使用独立密钥和月份盐生成的不可逆哈希。
- 设备、浏览器和操作系统保存归一化类别，不保存完整指纹。
- 明确识别的爬虫写入 `isBot=true`，默认从经营报表和在线人数中排除。

## 5. 数据模型

### 5.1 分析模型

- `AnalyticsVisitor`：匿名标识、首次/最近访问、首次/最近来源、国家地区、设备摘要、可选 `linkedLeadId`。
- `AnalyticsSession`：访客、开始/最后活动/结束时间、入口/出口、来源参数、地理与设备、页面和事件计数。
- `AnalyticsPageView`：页面路径、标题、来源页、产品关联、开始/心跳/退出时间、有效停留秒数、幂等键。
- `AnalyticsEvent`：类型、发生时间、页面、产品、允许字段白名单、幂等键。
- `SiteSearchEvent`：查询词和结果数；首期仅建兼容接口，不收集、不展示。
- `AnalyticsDailySummary`：日期、维度、指标 JSON，用于长期趋势与低成本查询。

### 5.2 聊天模型

- `ChatConversation`：访客、会话、可选 Lead、状态、联系快照、最后消息时间、未读计数。
- `ChatMessage`：会话、发送方类型、可选管理员、客户端幂等键、正文、发送/送达/已读时间和有限元数据。
- `ChatAssignment`：会话、坐席、分配人、开始和结束时间，保留完整转接历史。

状态枚举：

- 会话：`OPEN`、`PENDING`、`CLOSED`、`SPAM`。
- 消息发送方：`VISITOR`、`AGENT`、`SYSTEM`。
- 消息类型：`TEXT`、`SYSTEM`。

### 5.3 CRM 关联

- 匿名聊天可以只存在于访客 CRM 中。
- 当访客提交有效邮箱时，可新建或关联现有 `Lead`；不得用占位邮箱创建客户。
- 聊天转为 Lead、分配、状态变化、备注和关闭都写入审计记录。
- GA4/GSC 聚合数据永远不参与个人身份合并。

## 6. API 与实时协议

### 6.1 公共端

- `POST /api/analytics/collect`：批量接收 page view、heartbeat 和白名单事件。
- `POST /api/chat/conversations`：创建或恢复匿名会话。
- `GET /api/chat/conversations/[id]/messages`：按游标同步历史。
- `POST /api/chat/conversations/[id]/messages`：幂等落库访客消息。
- `POST /api/chat/token`：签发短时实时令牌。
- `GET /api/realtime`：WebSocket 升级端点。

### 6.2 管理端

- `/api/admin/analytics/first-party/overview`
- `/api/admin/analytics/visitors`
- `/api/admin/analytics/visitors/export`
- `/api/admin/analytics/visitors/[id]`
- `/api/admin/chat/conversations`
- `/api/admin/chat/conversations/[id]/messages`
- `/api/admin/chat/conversations/[id]/assignment`
- `/api/admin/chat/conversations/[id]/status`
- `/api/admin/chat/quick-replies`

所有管理端接口复用现有管理员 Session、权限检查、同源保护和审计日志。列表接口统一使用游标或稳定的 `createdAt + id` 排序，导出使用当前筛选条件。

### 6.3 WebSocket 事件

客户端上行：`auth`、`subscribe`、`typing.start`、`typing.stop`、`message.read`、`presence.ping`。  
服务端下行：`ready`、`message.created`、`message.delivered`、`message.read`、`typing.changed`、`presence.changed`、`conversation.updated`、`resync.required`、`error`。

每个事件包含版本、事件 ID、服务器时间和限定作用域。重连后客户端以最后消息游标调用 HTTP 同步，再恢复实时订阅。

## 7. 权限模型

新增角色：`SUPPORT_AGENT`、`SUPPORT_SUPERVISOR`。

新增权限：

- `analytics.read.summary`
- `analytics.read.visitors`
- `analytics.export`
- `chat.read.assigned`
- `chat.read.all`
- `chat.reply.assigned`
- `chat.reply.all`
- `chat.assign`
- `chat.manage`

管理员和超级管理员拥有全部分析与聊天权限；销售可查看自己关联的 Lead 与被分配会话；客服坐席只能访问当前分配会话；主管可查看、分配和转接全部会话。现有角色权限不被隐式扩大。

## 8. 隐私、安全和保留策略

- 第一方分析只在用户接受 Analytics 同意后启用；聊天作为用户主动请求的功能独立工作。
- 只接收字段白名单，禁止在分析事件属性中提交邮箱、电话、消息正文或其他 PII。
- 聊天正文做大小限制、纯文本处理、速率限制和蜜罐/机器人防护。
- Redis key 使用环境前缀，Preview 与 Production 完全隔离。
- 原始分析事件和页面浏览默认保留 180 天；日汇总保留 730 天；聊天默认保留 24 个月；Lead 按现有业务规则保留。
- 提供按访客删除分析和聊天数据的管理操作；删除必须审计，Lead 不随匿名数据自动删除。
- 所有生产迁移使用 `prisma migrate deploy`；构建阶段只执行 `prisma generate`，不连接或修改生产数据库。

## 9. 高端工业 B2B SaaS 视觉系统

### 9.1 设计语言

- 背景 `#F5F6F8`，主卡片 `#FFFFFF`，主文字 `#1A1D21`，次文字 `#69707A`。
- 品牌绿 `#76B900` 只用于主操作、在线、积极增长和当前导航；危险和警告使用独立语义色。
- 侧栏使用深石墨 `#0B0D10`，分组标签低对比，活动项采用绿色细边/柔和底色而非整块高饱和色。
- 8pt 间距系统，卡片圆角 12px，控件圆角 10px，细边框与克制阴影；不使用装饰性渐变和无意义动画。
- 动效只用于状态反馈，160–220ms，并尊重 `prefers-reduced-motion`。

### 9.2 信息架构

侧栏分组：

1. **经营概览**：总览、数据分析、访客分析；
2. **客户增长**：在线聊天、询盘 CRM；
3. **内容运营**：页面、Banner、产品分类、产品、参数、媒体、SEO；
4. **系统管理**：用户权限、设置。

顶栏包含面包屑、全局入口、实时连接状态、通知和管理员菜单。移动端使用抽屉导航，主要操作保持 44px 触控高度。

### 9.3 核心页面

- **经营总览**：KPI 条、8 列趋势图、4 列实时访客、来源/国家/产品卡片、待处理询盘和聊天队列。
- **访客列表**：组合筛选、固定表头、列密度、分页/导出；点击后打开右侧抽屉显示会话、页面、事件和 CRM 关联时间线。
- **实时聊天**：桌面三栏（会话 280px、消息自适应、客户资料 340px）；平板和手机逐层折叠，不压缩消息可读性。
- **状态**：所有数据区都提供 skeleton、真实空状态、权限不足、配置缺失、断线重连和可恢复错误状态。

## 10. 性能与可观测性

- 浏览事件批量发送，单次最多 20 条/16KB；使用 `sendBeacon` 补发退出事件。
- 心跳只更新必要字段；日汇总避免后台反复扫描明细表。
- 关键查询建立 `(lastSeenAt, id)`、`(visitorId, startedAt)`、`(sessionId, occurredAt)`、`(conversationId, sentAt)` 等复合索引。
- 实时错误记录事件类型、部署环境和匿名关联 ID，不写消息正文、邮箱、令牌或 Redis 密钥。
- 后台显示 GA4、GSC、第一方跟踪和实时连接四个独立健康状态，避免把“未配置”显示成零数据。

## 11. 分阶段交付

1. **访客数据底座**：数据库、权限、同意后跟踪、在线规则、聚合服务。
2. **分析后台与视觉系统**：统一后台外壳、经营看板、访客列表/抽屉/导出。
3. **实时聊天与 CRM**：Redis、WebSocket、公共聊天组件、三栏工作台、分配与 Lead 关联。
4. **报表、隐私和上线**：日报、漏斗、数据保留/删除、负载验证、Preview 和生产验收。

每阶段必须通过相关单元测试、集成测试、类型检查、Lint 和生产构建。数据库迁移先在测试与 Preview 环境验证；正式生产迁移和域名切换前再次确认部署窗口。

## 12. 验收标准

- 实时在线与活跃规则在多标签页、隐藏标签、断网和重连下保持正确。
- 访客、会话、页面、事件、聊天和 Lead 之间的关系可追踪且不会跨匿名身份泄漏。
- 两个独立浏览器可以实时聊天；消息刷新后仍存在，重复发送不产生重复记录。
- 未授权管理请求返回设计预期的 401/403；坐席不能读取未分配会话。
- GA4/GSC 缺失、Redis 缺失或实时功能关闭时页面显示明确状态，官网与现有 CMS 仍可用。
- 所有后台关键页面在桌面、平板和手机可操作，键盘焦点、对比度和触控尺寸满足 WCAG 2.2 AA 的核心要求。
- Production 不包含模拟访客、模拟客户或模拟聊天记录。

## 13. 参考依据

- Vercel WebSocket Public Beta：https://vercel.com/changelog/websocket-support-is-now-in-public-beta
- Vercel WebSocket 运行与限制：https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections
- Upstash Redis 定价：https://upstash.com/pricing/redis
- Upstash Redis Pub/Sub：https://upstash.com/docs/redis/features/restapi

