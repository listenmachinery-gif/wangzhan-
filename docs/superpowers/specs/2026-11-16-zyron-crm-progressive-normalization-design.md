# ZYRON CRM 渐进正规化升级设计

## 1. 意图

把现有可运行的 `Lead` 询盘工作台升级为适合工业机械外贸团队使用的客户与销售跟进系统，同时保留全部正式询盘、现有后台 URL、在线聊天关联、访客分析关联和权限边界。

系统的首要目标不是“做出更多页面”，而是让业务员可靠完成以下闭环：接收或录入询盘 → 识别客户与公司 → 分配负责人 → 记录每次沟通 → 更新销售阶段 → 安排下一次跟进 → 识别逾期 → 创建并保留报价版本 → 查询完整历史。

## 2. 用户与核心工作

- **管理员 / 超级管理员**：查看全部客户和询盘，管理阶段、人员、权限、数据质量和报表。
- **销售人员**：只操作分配给自己的客户与询盘，记录沟通、安排任务、创建报价并推进阶段。
- **销售经理（新增角色）**：查看和管理授权团队的客户、任务、报价与绩效。
- **只读人员（新增角色）**：查看授权范围内的数据，不得修改、导出敏感数据或查看受限制字段。
- **网站访客**：用英文提交真实采购需求；不接触后台内部备注、评分或销售记录。

## 3. 已选方案与方案比较

### 方案一：一次性重建标准 CRM

一次创建 `Customer`、`Inquiry`、`FollowUp`、`Quotation` 等全新体系，再迁移旧 `Lead`。模型最整齐，但会形成新旧并行期，生产迁移和关联回填风险最高，不采用。

### 方案二：基于现有 Lead 渐进正规化（已选）

保留 `Lead` 表、主键和已有关系，把它继续作为询盘核心实体；逐步增加公司、联系人、阶段历史、结构化跟进、任务、报价和附件模型。新 UI 使用“询盘”命名，数据库和旧 API 在过渡期保留 `Lead` 名称。采用此方案。

### 方案三：只升级现有 Lead 页面

只调整表格和详情页，无法支持多询盘客户、任务、报价版本和历史追踪，不满足业务目标，不采用。

## 4. 项目约束

- 不删除、覆盖或伪造现有询盘和客户资料。
- 不改变现有产品 URL、官网视觉、SEO 路径和现有后台 URL。
- `/admin/leads`、`/admin/leads/[id]` 及现有 Lead API 在兼容期继续可用。
- 使用真实 PostgreSQL、Prisma 和 Route Handler，不建立静态演示数据。
- 第一批数据库迁移只允许新增表、新增索引和新增可空字段；不删除或重命名生产列。
- 所有生产迁移必须先备份、在 Preview 验证，并在执行前再次获得明确授权。
- 所有日期以 UTC 持久化，界面按业务员时区显示。
- 未配置的 Gmail、WhatsApp Business 或其他第三方接口必须明确显示“未配置”。
- 客户个人资料不得发送到 GA4 或普通分析事件。
- 自动去重只能提供候选提示，不自动合并客户。

## 5. 领域模型策略

### 5.1 现有 Lead 的定位

`Lead` 继续代表一条独立询盘 / 销售机会。现有字段 `name`、`email`、`company`、`country`、`message` 等保留为“询盘提交时的原始快照”，即使联系人资料以后被修改，也不改写原始询盘内容。

新功能通过可空外键和新增子表连接，不要求旧数据一次性完成公司与联系人回填。

### 5.2 Company

新增 `Company`：

- `id`、`companyCode`、`name`、`normalizedName`
- `website`、`industry`、`companySize`
- `countryCode`、`state`、`city`、`postalCode`、`address`
- `ownerId`、`createdById`、`updatedById`
- `createdAt`、`updatedAt`、`version`

公司名称不做全局唯一约束；使用标准化名称、域名、国家和联系人信息生成重复候选。

### 5.3 Contact

新增 `Contact`，它承担“客户联系人”角色，不再增加重复的 `Customer` 表：

- `id`、`customerCode`
- `companyId`
- `fullName`、`firstName`、`lastName`
- `jobTitle`、`department`
- `email`、`normalizedEmail`
- `phone`、`phoneE164`、`whatsapp`、`whatsappE164`
- `countryCode`、`state`、`city`、`timezone`
- `preferredLanguage`、`preferredContactMethod`、`preferredContactTime`
- `customerLevel`、`customerStatus`
- `ownerId`、`internalNotes`
- `firstInquiryAt`、`lastInquiryAt`、`lastFollowUpAt`、`nextFollowUpAt`
- `createdById`、`updatedById`、`createdAt`、`updatedAt`、`version`

邮箱和手机号建立普通索引而非强制唯一约束，以避免共享邮箱、联系人换公司或历史脏数据导致迁移失败。服务层返回重复候选并要求人工确认。

联系人和公司的权限不等同于“任何关联销售都能看到全部历史”。询盘及其活动、报价和附件始终继承该 `Lead` 的数据范围；有权访问任一关联询盘的人员可以读取联系人/公司的基础资料，但只有联系人/公司 owner、授权销售经理或管理员可以修改。客户详情只汇总当前用户有权访问的询盘和时间轴，内部备注不跨数据范围返回。尚无询盘的联系人/公司按 owner 授权。

### 5.4 Lead 扩展字段

为现有 `Lead` 增加：

- `inquiryNumber`：唯一、可读编号
- `recordOrigin`：`WEBSITE_FORM | MANUAL | INTEGRATION`
- `sourceChannel`：`WEBSITE | EMAIL | WHATSAPP | PHONE | FACEBOOK | LINKEDIN | TRADE_SHOW | REFERRAL | OTHER`
- `companyId`、`contactId`
- `stageId`
- `customerLevel`、`intentScore`
- `estimatedDealAmount`、`estimatedCurrency`、`estimatedCloseDate`
- `lastFollowUpAt`、`lastResultCode`
- `lostReasonCode`、`lostReasonNote`
- `wonOrderNumber`、`wonAmount`、`wonCurrency`
- `attributionSnapshot`：仅保存询盘提交时合法获得的归因白名单字段
- `createdById`、`updatedById`

现有 `LeadStatus` 在兼容期继续保留。新阶段为权威销售流程；旧状态按映射同步，供旧页面、旧 API 和历史报表继续工作。

### 5.5 多产品询盘

新增 `InquiryItem`：

- `leadId`、`productId`、`categoryId`
- 产品名称和型号快照
- 数量、单位、币种、预算范围、采购日期、紧急度
- 目的地国家、港口、贸易术语

新增 `InquiryRequirement`：

- `inquiryItemId`
- `templateType`
- `data`：通过设备类别专用 Zod 白名单验证的 JSON
- `specialRequirements`
- `version`、`createdById`、`createdAt`

产品标准参数只用于表单提示，不自动复制成客户采购要求。修改需求时创建新版本，不覆盖旧版本。

## 6. 销售阶段

新增 `CrmStage` 与 `LeadStageHistory`。

默认阶段：

1. `NEW_INQUIRY`
2. `TO_CONTACT`
3. `CONTACTED`
4. `REQUIREMENT_CONFIRMED`
5. `SOLUTION_PREPARATION`
6. `QUOTATION_SENT`
7. `NEGOTIATION`
8. `AWAITING_DECISION`
9. `ORDER_CONFIRMED`
10. `WON`
11. `LOST`
12. `ON_HOLD`

阶段包含名称、顺序、颜色、是否启用、是否终态、是否必须填写原因。阶段代码不可修改，显示名称可配置。

旧状态映射：

- `NEW` → `NEW_INQUIRY`
- `CONTACTED` → `CONTACTED`
- `IN_DISCUSSION` → `NEGOTIATION`
- `QUOTED` → `QUOTATION_SENT`
- `WON` → `WON`
- `LOST` → `LOST`
- `SPAM` 不进入销售漏斗，继续作为隔离状态

新阶段写回旧状态的兼容映射：

- `NEW_INQUIRY`、`TO_CONTACT` → `NEW`
- `CONTACTED`、`REQUIREMENT_CONFIRMED`、`SOLUTION_PREPARATION` → `CONTACTED`
- `NEGOTIATION`、`AWAITING_DECISION`、`ON_HOLD` → `IN_DISCUSSION`
- `QUOTATION_SENT` → `QUOTED`
- `ORDER_CONFIRMED`、`WON` → `WON`
- `LOST` → `LOST`

所有旧、新入口调用同一阶段服务。旧状态写入若映射到当前细分阶段的同一兼容组，则保留当前细分阶段；跨组写入才更新阶段并记录历史。兼容期旧 API 写入 `LOST` 时，以系统原因代码 `LEGACY_API_NO_REASON` 保留兼容并写审计；新接口必须提供流失原因。`SPAM` 单独保存隔离标记和隔离前阶段，移出漏斗但不销毁销售阶段，恢复时回到隔离前阶段。

每次变更必须在同一事务中：校验权限和版本 → 校验必填原因 → 写入历史 → 更新 Lead → 写审计日志。`LOST` 必须选择原因；`WON` 可记录订单号和成交金额。阶段回退仅允许管理员、销售经理或单独授权角色。

## 7. 结构化跟进

复用并扩展现有 `LeadActivity`，避免创建第二套跟进记录。

新增字段：

- `occurredAt`、`channel`、`subject`
- `content`、`customerQuestions`、`customerFeedback`、`internalNotes`
- `resultCode`
- `previousStageId`、`newStageId`、`stageChangeReason`
- `customerLevel`、`intentScore`
- `estimatedDealAmount`、`estimatedCurrency`、`estimatedCloseDate`
- `quotationId`、`customerTargetPrice`、`priceDiscussionNotes`
- `isDraft`、`version`、`updatedAt`、`deletedAt`、`deletedById`

新增 `LeadActivityRevision` 保存编辑前后的完整结构化快照、修改人、修改时间和修改原因。原有活动记录保持可读。

新增跟进事务顺序：

1. 验证登录用户和 Lead 数据范围。
2. 验证联系人、询盘、报价和附件的关联。
3. 使用客户端幂等键防止重复提交。
4. 新增独立活动记录，不覆盖历史活动。
5. 如阶段变化，写入阶段历史并更新 Lead。
6. 更新 `lastFollowUpAt`、结果、等级和成交预估。
7. 如安排下一次行动，创建 `FollowUpTask`。
8. 关联私有附件。
9. 增加 Lead 版本并写 AuditLog。
10. 提交后返回完整的新时间轴节点。

## 8. 跟进任务与提醒

新增 `FollowUpTask`：

- `leadId`、`contactId`、`assignedToId`
- `title`、`description`、`nextAction`
- `dueAt`、`reminderAt`、`timezone`
- `priority`
- `status`：`TODO | IN_PROGRESS | COMPLETED | OVERDUE | CANCELLED`
- `completedAt`、`completedById`、`completionNote`
- `createdById`、`createdAt`、`updatedAt`、`version`

查询层即使 Cron 延迟，也把 `dueAt < now` 且未完成的任务显示为逾期；Cron 再把状态持久化为 `OVERDUE`。提醒记录使用任务 ID、提醒时间和渠道组成唯一幂等键。

任务功能上线后，“下一次跟进”的权威来源是当前用户数据范围内、未完成且未取消任务的最早 `dueAt`。`Lead.nextFollowUpAt` 仅作为兼容投影，由事务同步；旧 Lead API 写入日期时创建或更新一条带固定来源标识的兼容任务，清空日期只取消该兼容任务，不影响其他任务。历史 `nextFollowUpAt` 以幂等方式回填为兼容任务。`Contact.nextFollowUpAt` 只在有权限的查询中按可访问询盘动态汇总，不作为跨销售共享的独立权威值。

任务负责人必须位于该询盘的数据授权范围内。询盘转交时，未完成任务必须由转交事务明确选择“随询盘转交”或“取消并记录原因”，不得遗留为原负责人可访问的新数据入口。

新增 `/api/internal/crm/reminders`，使用 `CRON_SECRET`，每 15 分钟检查一次。第一阶段提供站内提醒；邮件提醒只在 SMTP 可用且管理员启用时发送。

## 9. 报价

新增 `Quotation`、`QuotationItem`、`QuotationVersion`：

- 报价编号、询盘、公司、联系人、币种、贸易术语、付款条款、有效期、交期、质保、总额和状态
- 条目保存产品名称、型号、规格快照、数量、单价、折扣和总价
- 每次修改创建不可变版本；当前报价只指向最新版本
- PDF 从具体版本生成，不能用最新数据覆盖旧 PDF
- 报价创建、发送、接受和拒绝事件进入统一时间轴

金额使用 Prisma `Decimal`，服务端重新计算汇总，不信任客户端总金额。

## 10. 私有附件

复用现有 S3/OIDC 存储适配器，但不把 CRM 文件放入可用于官网内容的 `MediaAsset` 访问路径。

新增 `CrmFileAsset` 和关联表：

- 原文件名、对象键、MIME、大小、哈希、用途、上传人、创建时间、软删除时间
- 允许 PDF、JPG、PNG；第二阶段按需要增加受验证的 CAD 文件类型
- 上传接口校验真实文件签名、声明类型和大小
- 下载必须重新校验 Lead 数据权限，生成短期签名 URL
- 日志和 API 响应不暴露存储密钥或内部对象路径

## 11. 前台询盘采集

保留 `/api/inquiry` 和所有现有产品 URL。

升级规则：

- 姓名、国家、需求描述必填；邮箱或有效 WhatsApp 至少一个必填
- 当前产品 ID、名称和型号由服务器根据页面提交值校验，不能只信任隐藏字段
- 保存 `recordOrigin=WEBSITE_FORM`
- 生成 InquiryItem、原始需求快照和合法归因快照
- 联系人匹配只返回候选；明确命中同一标准化邮箱时可关联，但不得静默合并不同公司
- 保留蜜罐、限流和通知失败不丢询盘的现有行为
- 增加幂等提交键，防止刷新和网络重试创建大量重复询盘
- `sourcePage` 只保留路径和允许的 UTM / 广告参数，移除令牌、邮箱和任意查询参数
- GA4 事件只发送匿名事件名、页面和产品标识，不发送个人资料

邮箱或 WhatsApp 二选一分两步上线：兼容基础阶段继续保持当前邮箱必填；前台询盘升级阶段先让读取、导出、通知、去重和后台表单全部支持邮箱缺失，再通过独立非破坏性迁移把 `Lead.email` 改为可空，最后才启用 WhatsApp-only 表单。禁止用假邮箱占位。现有允许缺少姓名的选型入口在兼容期继续接受，升级后的新表单执行姓名必填。

## 12. 后台页面与 URL

保留现有 URL，并增加以下页面：

- `/admin` 与 `/admin/dashboard`：同一真实经营仪表盘
- `/admin/leads`：继续可用，显示升级后的询盘列表
- `/admin/inquiries`：与 `/admin/leads` 使用同一查询和组件
- `/admin/inquiries/new`
- `/admin/leads/[id]` 与 `/admin/inquiries/[id]`：共享询盘详情
- `/admin/customers`
- `/admin/customers/new`
- `/admin/customers/[id]`
- `/admin/follow-ups`
- `/admin/follow-ups/tasks`
- `/admin/follow-ups/pipeline`
- `/admin/quotations`
- `/admin/quotations/new`
- `/admin/quotations/[id]`
- `/admin/reports/crm`
- `/admin/settings/crm`

### 询盘列表

固定表头、横向滚动、分页、搜索和筛选。默认列：询盘编号、客户、公司、国家、联系方式、产品、来源、阶段、等级、负责人、最近跟进、下次跟进、逾期状态、报价金额和创建时间。

### 询盘详情

- 顶部：客户、公司、国家、阶段、等级、负责人、关键操作
- 左侧：联系人、公司、采购产品、需求参数、来源归因
- 中间：原始询盘、统一时间轴、跟进记录、报价历史
- 右侧：负责人、下一任务、意向评分、成交预估、快捷操作
- 主要操作：新增跟进、修改阶段、创建报价、发邮件、联系 WhatsApp、创建任务

### 新增跟进

使用抽屉或宽模态框，按“沟通 → 结果 → 阶段与意向 → 下一步 → 附件”分区。保存按钮固定在底部，显示校验、保存中、成功和冲突状态。

## 13. API 兼容与新增接口

保留现有 Lead API，并由同一服务层提供新命名接口：

- `GET/POST /api/admin/inquiries`
- `GET/PATCH /api/admin/inquiries/[id]`
- `GET/POST /api/admin/inquiries/[id]/follow-ups`
- `PATCH /api/admin/inquiries/[id]/stage`
- `GET/POST /api/admin/follow-up-tasks`
- `PATCH /api/admin/follow-up-tasks/[id]`
- `GET/POST /api/admin/customers`
- `GET/PATCH /api/admin/customers/[id]`
- `GET/POST /api/admin/quotations`
- `GET/PATCH /api/admin/quotations/[id]`
- `POST /api/admin/quotations/[id]/versions`
- `GET /api/admin/reports/crm`

所有写接口使用同源验证、服务端 Zod 校验、资源级 RBAC、乐观锁和审计日志。列表接口执行数据范围过滤，而不是只隐藏前端按钮。

## 14. 权限

新增 `CrmTeam` 与 `CrmTeamMembership`，保存团队、成员、经理、有效期和创建/更新审计。销售经理只能访问其有效团队成员的数据；只读人员必须绑定明确团队或资源范围，不存在“默认全局只读”。角色与团队模型完成并通过权限测试前，不在生产环境开放新增销售经理和只读角色。

在现有权限基础上增加：

- `customer.read/create/update/delete`
- `inquiry.create/update/assign`
- `followup.create/update/delete`
- `task.read/create/update/assign`
- `quotation.read/create/update/approve`
- `crm.report.read/export`
- `crm.settings.manage`

管理员与超级管理员可查看全部；销售人员只能访问当前分配给自己的 Lead 及其活动、任务、报价和附件。联系人/公司按 §5.3 的共享规则处理。销售经理按团队范围过滤。只读角色不能修改、导出、读取内部备注或下载受限制附件，联系方式按明确字段权限返回。

内部备注单独返回；未来字段级权限可以隐藏客户联系方式和内部备注。API 不通过前端隐藏来代替权限判断。

## 15. 客户等级与评分

人工等级 `A/B/C/D` 与系统评分分开保存。

系统评分只使用已获得的数据：资料完整度、需求明确度、采购时间、预算或报价互动、真实跟进互动和同意后的有效网站行为。每个评分项保存依据和分值；未知数据得 0 分并标记“未获取”，不进行国家、敏感属性或采购能力推测。

人工修改等级必须填写原因并写 AuditLog。

## 16. 报表口径

第一阶段真实指标：今日/昨日/本周/本月询盘、待联系、待报价、已报价、谈判中、已成交、已流失、今日待跟进、逾期任务、报价转化和成交金额。

所有指标明确区分：

- 询盘数与独立联系人/公司数
- 会话数与访客数
- 报价数与询盘数
- 人工阶段与系统评分

筛选支持日期、国家、产品、来源和负责人。无数据展示空状态，不生成随机数字。

## 17. 迁移与回填

### 迁移一：兼容基础

- 新增 Company、Contact、Stage、StageHistory、CrmTeam、CrmTeamMembership、扩展 Lead 可空字段和必要索引
- 新增默认阶段种子脚本
- 不回填、不修改现有 Lead

### 迁移二：跟进与任务

- 扩展 LeadActivity
- 新增 ActivityRevision、FollowUpTask、ReminderDelivery、CRM 文件模型

### 迁移三：产品需求与报价

- 新增 InquiryItem、InquiryRequirement、Quotation、QuotationItem、QuotationVersion
- 在全部读取路径已支持缺失邮箱后，单独把 `Lead.email` 放宽为可空；该变更与 WhatsApp-only 表单同一阶段验收

### 回填

- 独立、可重跑、带 dry-run 的脚本
- 先输出候选公司、联系人、阶段映射和冲突数
- 自动关联只处理明确且无冲突的记录
- 重复或不完整记录保留未关联状态，交给管理员确认
- 历史 `nextFollowUpAt` 幂等回填为带固定来源标识的兼容任务
- 每批有上限、审计记录和失败恢复点

生产执行前：创建数据库备份/恢复点 → 在 Preview 克隆数据验证 → 运行迁移 → 运行 dry-run → 审查统计 → 分批回填 → 验收 → 切换 UI。禁止 `migrate reset` 和生产 `migrate dev`。

## 18. 并发、幂等与错误处理

- Lead、Contact、Task、Quotation 使用 `version` 乐观锁。
- 阶段、跟进、任务和报价版本在事务中保存。
- 公开询盘、跟进提交、任务完成和通知发送支持幂等键。
- 冲突返回 409，权限返回 403，找不到返回 404，校验返回 400/422。
- 邮件、站内提醒和 PDF 生成失败不能回滚已提交的询盘或跟进；使用状态记录支持重试。
- 所有错误日志只记录安全错误码、实体类型和请求 ID，不记录客户正文或联系方式。

## 19. 安全与隐私

- 保留当前 Session 和同源写入保护。
- 联系方式、内部备注、附件和导出均执行资源权限。
- 所有文本按纯文本保存和转义展示，不渲染未经清洗的 HTML。
- 文件检查大小、扩展名、MIME 和真实签名。
- 归因与 CRM 个人资料隔离；匿名会话只有在合法关联条件成立时关联 Lead。
- 提供访问、更正和删除工作流；删除默认软删除，法定删除由管理员确认后执行专用服务。
- 不爬取私人 WhatsApp；未配置官方 API 时只提供 `wa.me` 快捷入口和人工沟通记录。
- 不把 GSC 汇总关键词分配给具体客户。

## 20. 交付阶段

### 阶段 1：兼容基础与客户/询盘管理

数据模型、阶段、客户/公司、手动询盘、列表和详情基础升级。

### 阶段 2：结构化跟进与任务

完整跟进表单、时间轴、阶段历史、下一任务、逾期和站内待办。

### 阶段 3：前台询盘与归因

产品预填、多设备需求、合法归因、幂等提交和客户候选关联。

### 阶段 4：报价与沟通

报价版本、PDF、邮件/WhatsApp 快捷入口、私有附件。

### 阶段 5：看板和报表

Pipeline、任务日历、销售绩效、国家/产品/来源和转化漏斗。

### 阶段 6：设置和外部集成入口

阶段、标签、通知、保留期限、Gmail 和 WhatsApp Business 配置状态。

每个阶段独立迁移、独立测试、独立 Preview 验收，不把全部功能捆成一次生产发布。

## 21. 测试与验收

- 网站询盘真实入库且邮件失败不丢数据
- 手动创建客户与询盘并刷新后保持
- 已有联系人新增第二条询盘不创建不必要重复联系人
- 新增两次跟进后两次记录都保留
- 阶段变更保存旧阶段、新阶段、原因、人员和时间
- 跟进与阶段、下一任务同事务保存
- 到期任务正确显示今日、逾期和完成状态
- 销售人员无法读取或修改他人 Lead、活动、任务、报价和附件
- 邮箱、E.164 WhatsApp、国家、金额、日期和动态参数校验
- 重复提交不生成大量重复询盘或跟进
- 报价修改创建新版本，历史版本不变
- 未获取来源显示 Unknown/未获取
- GA4 事件不包含客户 PII
- 空数据下列表、看板和报表正常
- 不允许的附件和超大附件被拒绝
- 并发修改返回冲突，不静默覆盖
- Preview 与 Production 使用各自数据库配置
- 旧 `/admin/leads`、旧 API、首页、分类和产品页保持正常
- 每阶段执行 Prisma generate、类型检查、Lint、单元测试、集成测试、E2E 和生产构建

## 22. 非目标

首批不实现：

- 自动读取私人 WhatsApp 聊天
- 未授权 Gmail 邮件同步
- ERP、发票、支付或物流系统
- 自动合并重复客户
- AI 自动判定客户质量或采购能力
- 在没有官方授权时模拟第三方接口已连接

这些功能只能在对应官方 API、OAuth、Webhook 验签和数据授权明确后独立设计。

