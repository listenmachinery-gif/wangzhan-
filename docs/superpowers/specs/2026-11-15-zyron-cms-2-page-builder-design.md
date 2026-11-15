# ZYRON CMS 2.0 Page Builder MVP 设计

## 目标

在不改变现有 URL、首页视觉和既有数据的前提下，提供一条真实可用的“后台编辑首页模块 → 保存草稿 → 桌面/平板/手机预览 → 发布 → 前台读取 → 历史版本回滚”链路。

## 非目标

- 本阶段不迁移全部产品详情、分类、公司页或多语言内容。
- 本阶段不执行生产数据库迁移或生产部署。
- 本阶段不删除旧产品模块、硬编码首页内容或现有媒体。
- 本阶段不允许任意脚本、原始 HTML 或任意 CSS 注入。

## 方案比较

1. 整页立即替换：结构简单，但数据库缺失或编辑错误会让现有首页大面积丢失，不接受。
2. 在现有首页增加固定配置表：风险小，但无法形成可复用页面树和后续全站迁移基础，不接受。
3. 增量页面文档与兼容插槽：Page Builder 管理安全 JSON 树，首页先让两个现有非 Banner 区块接受已发布内容；没有发布数据时继续渲染原内容。采用此方案。

## 数据模型

- `SitePage` 保存页面身份、Slug、类型、草稿文档、已发布文档、乐观锁版本、发布状态和当前发布版本号。
- `PageVersion` 保存不可变快照、创建人、版本号、来源动作与发布时间，支持历史查看和回滚到新草稿。
- 页面文档为经 Zod 校验的版本化 JSON：`{ schemaVersion, nodes }`。
- 节点含稳定 ID、组件类型、内容、基础样式和 Desktop/Tablet/Mobile 覆盖；样式仅允许白名单字段与受控范围。

## 组件与编辑器

- 首批注册 25 个可渲染组件：Heading、Paragraph、Image、Video、Button、Divider、Spacer、RichText、Section、Row、Columns、Grid、Tabs、Accordion、Hero、ProductCards、CategoryCards、ProductGallery、SpecificationTable、ModelComparison、FactoryIntro、Certificates、Applications、Advantages、FAQ、InquiryCTA、WhatsAppCTA、DownloadCatalog（实际不少于 25）。
- 组件注册表统一提供类型、中文标签、默认内容、Zod Schema 和渲染器。
- 编辑器三栏：左侧组件库/结构树，中间真实响应式画布，右侧内容和样式属性；顶部提供保存、撤销/重做、设备切换、预览、历史、发布与回滚。
- 拖拽采用 `@atlaskit/pragmatic-drag-and-drop` 4.0.0，Apache-2.0，2026-09 仍有发布记录，且不锁定 React 版本；键盘上移/下移作为可访问性回退。

## 权限和安全

- 新增 `page.read`、`page.write`、`page.publish` 权限，CONTENT_EDITOR 和 ADMIN 可编辑，发布需要 `page.publish`。
- 所有写 API 校验同源请求、服务端 Session、权限、输入 Schema 与乐观锁版本。
- 草稿预览位于受保护的 admin 路由，设置 `noindex`；公开前台只读取 `publishedContent`。
- RichText 只存结构化段落/列表，不接收原始 HTML。

## 首页兼容策略

- 首批将“Company Strength/Factory Stats”和“Why Choose ZYRON”两个现有区块提取为可接收内容的组件。
- 已发布首页文档中存在对应节点时使用数据库内容；否则使用当前常量并保持现有 DOM、样式、图片与链接。
- 页面设计器可新增和排序其它组件；MVP 的新增组件在首页受管区域渲染，旧的未迁移区块仍保持原位。

## 验证

- 单元：文档 Schema、注册表覆盖、响应式样式白名单、导航权限、编辑器撤销/重做。
- 集成：权限、保存冲突、草稿隔离、发布、版本历史、回滚、审计日志与精确路径 revalidate。
- E2E：管理员编辑两个首页区块、三端预览、发布后首页出现内容、游客无法读取草稿、回滚后恢复。
- 全量：typecheck、lint、unit、integration、Playwright、production build。
