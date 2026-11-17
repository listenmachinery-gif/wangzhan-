# ZYRON CMS 管理后台统一中文显示实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 ZYRON CMS 所有系统生成的后台标签、国家、来源、设备、状态和角色统一显示为中文，同时保持数据库、API、筛选值和 URL 不变。

**Architecture:** 新增一个纯函数形式的后台中文显示模块，集中处理 ISO 国家代码、营销来源、设备类型和业务枚举。React 组件和 CSV 导出仅在输出边界调用该模块，不改写原始数据。

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma 7, Vitest, Playwright, `Intl.DisplayNames`

**Spec:** `docs/superpowers/specs/2026-11-17-admin-chinese-localization-design.md`

## Global Constraints

- 数据库中的 ISO 代码、Prisma 枚举、UTM 来源和 API 字段不得修改。
- 现有 URL、查询参数和前台外贸网站内容不得修改。
- Google、WhatsApp、Facebook、LinkedIn、SEO、CRM、URL、IP 等品牌和专业缩写保留原名。
- 客户填写的姓名、公司、需求、邮件和产品内容保留原文。
- 未识别的国家或来源保留原值，空值按界面语义显示“未知”或“—”。
- 生产发布必须在 Preview 验收后另行获得明确授权。

## Review Focus

- 小写、空格或无效 ISO 代码：合法代码应正常中文化，非代码应保留原文。
- 新增的 UTM 来源：字典未收录时不应显示为“未知”或丢失原值。
- Server Component 与 Client Component 共用：本地化模块不得依赖 Node-only API 或产生 hydration 差异。
- 导出安全：中文化不得破坏现有 CSV 公式注入防护和 UTF-8 BOM。
- 筛选一致性：中文选项提交后仍必须使用原始枚举或 ISO 代码查询。

---

### Task 1: 后台中文显示核心模块

**Files:**
- Create: `lib/admin/localization.ts`
- Create: `tests/unit/admin/localization.test.ts`

**Interfaces:**
- Consumes: 浏览器和 Node.js 共有的 `Intl.DisplayNames`。
- Produces: `formatCountryName(value, fallback?)`, `formatTrafficSource(value, fallback?)`, `formatTrafficMedium(value, fallback?)`, `formatDeviceType(value, fallback?)`, `formatAdminEnum(value, fallback?)` 及各类中文标签常量。

- [x] **Step 1: 编写失败单元测试**

  断言 `US -> 美国`、`de -> 德国`、`desktop -> 桌面端`、`direct -> 直接访问`、`organic -> 自然搜索`、`DRAFT -> 草稿`、`SUPER_ADMIN -> 超级管理员`，并断言未知 UTM 值和非 ISO 国家原文保留。

- [x] **Step 2: 验证测试按预期失败**

  Run: `npx vitest run tests/unit/admin/localization.test.ts`
  Expected: FAIL because `@/lib/admin/localization` does not exist.

- [x] **Step 3: 实现纯函数本地化模块**

  `formatCountryName` 只对两位英文字母代码调用 `Intl.DisplayNames(["zh-CN"], { type: "region" })`；所有函数接受 `string | null | undefined` 并返回 `string`。枚举字典覆盖发布、询盘、聊天、用户角色、客户等级、页面类型和媒体用途。

- [x] **Step 4: 运行单元测试确认通过**

  Run: `npx vitest run tests/unit/admin/localization.test.ts`
  Expected: PASS.

- [x] **Step 5: 提交核心模块**

  Commit: `feat(admin): add shared Chinese display labels`

### Task 2: 访客分析、报表与 CSV 中文化

**Files:**
- Modify: `components/admin/analytics/visitors/VisitorTable.tsx`
- Modify: `components/admin/analytics/visitors/VisitorTimelineDrawer.tsx`
- Modify: `components/admin/analytics/visitors/VisitorFilters.tsx`
- Modify: `components/admin/analytics/reports/AnalyticsReports.tsx`
- Modify: `lib/services/visitor-analytics-query-service.ts`
- Modify: `tests/e2e/admin-visitors.spec.ts`
- Modify: `tests/integration/analytics/visitor-export.test.ts`

**Interfaces:**
- Consumes: Task 1 的国家、来源、媒介、设备和枚举格式化函数。
- Produces: 完全中文化的访客列表、旅程抽屉、分析报表和 CSV 导出。

- [x] **Step 1: 先更新集成与 E2E 断言**

  增加“US 显示美国”、“DE 显示德国”、“desktop 显示桌面端”、“direct/organic 显示中文”和中文 CSV 列头/值断言；同时保留 `countryCode=US` 查询参数断言。

- [x] **Step 2: 验证新断言失败**

  Run: `npm run test:integration -- tests/integration/analytics/visitor-export.test.ts`
  Expected: FAIL on English headers/raw codes.

- [x] **Step 3: 将格式化函数接入访客界面与导出**

  替换 `Visitor journey`、`direct / none`、原始设备值和国家代码的直接渲染。CSV 仅改显示列头与导出值，并继续通过现有 CSV 安全转义。

- [x] **Step 4: 运行访客分析测试**

  Run: `npm run test:integration -- tests/integration/analytics/visitor-export.test.ts tests/integration/analytics/visitor-query-service.test.ts`
  Expected: PASS.

- [x] **Step 5: 提交访客分析中文化**

  Commit: `feat(admin): localize visitor analytics in Chinese`

### Task 3: CRM 与在线聊天中文化

**Files:**
- Modify: `components/admin/crm/InquiryList.tsx`
- Modify: `components/admin/crm/InquiryDetail.tsx`
- Modify: `components/admin/crm/CustomerList.tsx`
- Modify: `components/admin/crm/CustomerDetail.tsx`
- Modify: `components/admin/leads/LeadTable.tsx`
- Modify: `components/admin/leads/LeadDetail.tsx`
- Modify: `components/admin/chat/AgentConversation.tsx`
- Modify: `components/admin/chat/VisitorContextPanel.tsx`
- Modify: `tests/e2e/admin-leads.spec.ts`
- Modify: `tests/e2e/admin-chat.spec.ts`

**Interfaces:**
- Consumes: Task 1 的国家、设备、询盘状态、聊天状态和客户等级标签。
- Produces: CRM 和在线聊天界面中不再直接显示可翻译的枚举或 ISO 代码。

- [x] **Step 1: 编写 CRM/聊天失败断言**

  在现有数据中断言 `US -> 美国`、`mobile -> 移动端`、`PENDING -> 待处理`、`NEW -> 新询盘`，并确认表单仍提交原枚举值。

- [x] **Step 2: 运行相关 E2E 确认新断言失败**

  Run: `npm run test:e2e -- tests/e2e/admin-leads.spec.ts tests/e2e/admin-chat.spec.ts`
  Expected: FAIL on raw English labels.

- [x] **Step 3: 接入统一中文显示函数**

  仅修改渲染标签和选项文字，`value`、PATCH/POST 请求体和权限分支仍使用原枚举。

- [x] **Step 4: 运行 CRM 和聊天 E2E**

  Run: `npm run test:e2e -- tests/e2e/admin-leads.spec.ts tests/e2e/admin-chat.spec.ts`
  Expected: PASS.

- [x] **Step 5: 提交 CRM/聊天中文化**

  Commit: `feat(admin): localize CRM and chat labels`

### Task 4: 内容管理与系统管理枚举中文化

**Files:**
- Modify: `app/admin/products/page.tsx`
- Modify: `components/admin/products/ProductTable.tsx`
- Modify: `components/admin/products/CategoryManager.tsx`
- Modify: `components/admin/pages/PageList.tsx`
- Modify: `components/admin/pages/PageBuilder.tsx`
- Modify: `components/admin/banners/BannerEditor.tsx`
- Modify: `components/admin/media/MediaLibrary.tsx`
- Modify: `components/admin/users/UserEditor.tsx`
- Modify: `components/admin/chat/ConversationList.tsx`
- Modify: 核查后确认存在原始枚举直接渲染的 `app/admin/**` 和 `components/admin/**` 文件。
- Modify: 对应现有后台 E2E 测试。

**Interfaces:**
- Consumes: Task 1 的发布状态、页面类型、用户角色、媒体用途及通用枚举字典。
- Produces: 产品、分类、页面、Banner、媒体、用户及剩余后台模块的中文系统标签。

- [x] **Step 1: 为原始枚举显示增加失败断言**

  在产品、分类、页面和用户测试中覆盖 `DRAFT/PUBLISHED/ARCHIVED`、页面类型及 `SUPER_ADMIN/SALES_MANAGER/CRM_VIEWER` 的中文标签。

- [x] **Step 2: 运行相关单元/E2E 测试确认失败**

  Run: `npm test -- tests/unit/admin/localization.test.ts`
  Expected: FAIL on missing mappings or raw render assertions.

- [x] **Step 3: 逐模块替换直接渲染**

  对下拉选项使用 `<option value="DRAFT">草稿</option>` 等模式，对表格和徽标使用 Task 1 格式化函数。路径、slug、MIME 类型和版本号保留技术原值。

- [x] **Step 4: 运行后台主要模块 E2E**

  Run: `npm run test:e2e -- tests/e2e/admin-products.spec.ts tests/e2e/admin-pages.spec.ts tests/e2e/admin-banners.spec.ts tests/e2e/admin-media.spec.ts tests/e2e/admin-auth.spec.ts`
  Expected: PASS.

- [x] **Step 5: 提交内容与系统模块中文化**

  Commit: `feat(admin): localize content and system modules`

### Task 5: 全量核查、构建与 Preview 验收

**Files:**
- Modify: `tests/unit/admin/localization.test.ts`
- Modify: 核查发现的剩余 `app/admin/**` 和 `components/admin/**` 文件。
- Modify: `docs/superpowers/plans/2026-11-17-admin-chinese-localization.md` 勾选完成项。

**Interfaces:**
- Consumes: Tasks 1–4 的所有中文显示输出。
- Produces: 通过完整验证的 Preview 部署和验收报告。

- [x] **Step 1: 执行可见英文和原始枚举静态核查**

  Run: `rg -n 'Visitor journey|>DRAFT<|>PUBLISHED<|>ARCHIVED<|>SUPER_ADMIN<|>SALES_MANAGER<|>CRM_VIEWER<|\\{[^}]*countryCode[^}]*\\}|\\{[^}]*deviceType[^}]*\\}' app/admin components/admin`
  Expected: 无可翻译的用户可见原始值；仅允许类型、分支条件、`value` 和品牌/技术术语。

- [x] **Step 2: 运行全部单元和集成测试**

  Run: `npm test`
  Expected: PASS.

  Run: `npm run test:integration`
  Expected: PASS using the guarded test database only.

- [x] **Step 3: 运行静态检查与生产构建**

  Run: `npm run typecheck && npm run lint && npm run build`
  Expected: all commands exit 0; Next.js emits all admin routes.

- [x] **Step 4: 部署 Preview 并验收**

  Run: `vercel deploy --yes`
  Expected: deployment state `READY`.

  使用真实 Preview 数据库登录后验收访客分析、CRM、聊天、产品、分类、页面、Banner、媒体和用户页面；检查桌面端和移动端，以及未登录 API 仍返回 401。

- [x] **Step 5: 提交最终核查修正并推送分支**

  Commit: `test(admin): verify Chinese localization coverage`

  Push: `git push origin codex/cms-2-phase1`

- [x] **Step 6: 在 Preview 验收通过后请求 Production 发布授权**

  未获得当前变更的明确 Production 授权前，不促销、不别名、不部署到 `www.zyroncnc.com`。

