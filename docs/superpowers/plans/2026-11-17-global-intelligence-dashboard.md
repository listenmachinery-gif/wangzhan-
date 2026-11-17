# ZYRON 全球业务数据中心 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 `/admin` 数据总览升级为使用真实第一方、Google 和 CRM 数据的响应式可视化业务大屏。

**Architecture:** 保留现有 API 和权限边界，新增共享大屏数据模型与专用 React 组件，在客户端并行组合第一方、GA4、Search Console 和询盘接口。世界地图动态加载，趋势与漏斗使用轻量 SVG/CSS；每个来源独立处理加载、空数据和错误。

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma 7, PostgreSQL, react-simple-maps, world-atlas, Vitest, Playwright

**Spec:** `docs/superpowers/specs/2026-11-17-global-intelligence-dashboard-design.md`

## Global Constraints

- 原路由保持 `/admin`，不修改公开 URL、产品详情、SEO、询盘提交流程或既有后台模块。
- 数据库、Prisma Schema、GA4/GTM 埋点和第三方凭据不变。
- 生产页面不得包含随机数、设计图示例数值或推断出的客户身份。
- GA4、Search Console、第一方访客和 CRM 数据口径必须保持独立。
- 不具备 `analytics.read.summary` 权限的角色保留受限运营概览。
- 未获得新一轮生产授权前，只允许 Preview 部署。

## Review Focus

- Google 任一来源未配置或失败时，其他来源和第一方大屏仍正常渲染。
- 访客数为零时转化率显示 `--`，不出现 `NaN` 或 `Infinity`。
- 日期快速切换时旧请求被取消，旧响应不能覆盖新范围。
- 国家或设备无数据时筛选恢复“全部”，地图与表格展示一致空态。
- 没有导出或 CRM 权限时对应控制和数据不会泄露。

---

### Task 1: 大屏共享数据模型与纯函数

**Files:**
- Create: `lib/dashboard/types.ts`
- Create: `lib/dashboard/model.ts`
- Create: `tests/unit/admin/dashboard-model.test.ts`

**Interfaces:**
- Consumes: `AnalyticsOverview`、第一方日报报告、`FirstPartyOverview`、内容统计。
- Produces: `DashboardRange`、`DashboardKpi`、`DashboardTrendPoint`、`buildDashboardKpis()`、`buildDashboardTrend()`、`dashboardDateWindow()`。

- [ ] **Step 1: 编写失败单元测试**

  覆盖 7/28/90 天日期窗口、趋势合并、真实零值、不可用 Google 值、转化率除零和来源标签。

- [ ] **Step 2: 运行测试确认按预期失败**

  Run: `npx vitest run tests/unit/admin/dashboard-model.test.ts`
  Expected: FAIL because `@/lib/dashboard/model` does not exist.

- [ ] **Step 3: 实现数据模型与纯函数**

  所有聚合只消费接口数据；Google 无数据时返回 `available: false`，不得生成默认数值。

- [ ] **Step 4: 运行测试确认通过**

  Run: `npx vitest run tests/unit/admin/dashboard-model.test.ts`
  Expected: PASS.

- [ ] **Step 5: 提交**

  Commit: `feat(admin): add dashboard data model`

### Task 2: 大屏可视化基础组件

**Files:**
- Create: `components/admin/dashboard/DashboardPanel.tsx`
- Create: `components/admin/dashboard/DashboardKpiGrid.tsx`
- Create: `components/admin/dashboard/MultiSeriesTrendChart.tsx`
- Create: `components/admin/dashboard/WorldTrafficMap.tsx`
- Create: `components/admin/dashboard/DashboardBreakdowns.tsx`
- Create: `tests/unit/admin/dashboard-visuals.test.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: Task 1 的共享类型与第一方国家、来源、产品和漏斗数组。
- Produces: 可访问的 KPI、趋势、地图、来源、漏斗、排行和空态组件。

- [ ] **Step 1: 编写失败组件测试**

  断言不可用指标显示 `--` 和原因、趋势含等价数据列表、国家排名和地图选中状态同步、空数组显示真实空态。

- [ ] **Step 2: 运行测试确认按预期失败**

  Run: `npx vitest run tests/unit/admin/dashboard-visuals.test.tsx`
  Expected: FAIL because dashboard visual components do not exist.

- [ ] **Step 3: 安装地图依赖**

  Run: `npm install react-simple-maps world-atlas`
  Expected: package and lock file update without peer dependency failure.

- [ ] **Step 4: 实现组件和深色设计 Token**

  地图通过动态导入避免阻塞首屏；使用 `world-atlas/countries-110m.json`，国家无数据时保持中性色并提供等价排名表。

- [ ] **Step 5: 运行组件测试确认通过**

  Run: `npx vitest run tests/unit/admin/dashboard-visuals.test.tsx`
  Expected: PASS.

- [ ] **Step 6: 提交**

  Commit: `feat(admin): add intelligence dashboard visuals`

### Task 3: 真实数据编排、工具栏与全屏模式

**Files:**
- Create: `components/admin/dashboard/DashboardToolbar.tsx`
- Create: `components/admin/dashboard/GlobalIntelligenceDashboard.tsx`
- Create: `tests/unit/admin/global-intelligence-dashboard.test.tsx`
- Modify: `app/admin/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/unit/admin/analytics-dashboard.test.tsx`

**Interfaces:**
- Consumes: `/api/admin/analytics/overview`、`/api/admin/analytics/reports`、`/api/admin/inquiries` 和 `LIVE_OVERVIEW_EVENT`。
- Produces: `/admin` 日常管理模式与浏览器 Fullscreen API 指挥中心模式。

- [ ] **Step 1: 编写失败交互测试**

  断言管理员看到“ZYRON 全球业务数据中心”和十个核心区域；无权限角色仍看到受限数据总览；日期切换更新 URL 并取消旧请求；刷新、自动刷新、国家/设备筛选、导出和全屏具有真实行为。

- [ ] **Step 2: 运行测试确认按预期失败**

  Run: `npx vitest run tests/unit/admin/global-intelligence-dashboard.test.tsx tests/unit/admin/analytics-dashboard.test.tsx`
  Expected: FAIL on missing dashboard component and old admin page.

- [ ] **Step 3: 实现并行请求和独立状态管理**

  每个来源独立 `loading/error/data`；范围变化取消旧请求；自动刷新 60 秒；第一方实时数据继续通过现有全局事件接收。

- [ ] **Step 4: 实现工具栏与全屏**

  日期范围、国家、设备、刷新、自动刷新、导出和全屏均为可聚焦控件；URL 使用原始筛选值。

- [ ] **Step 5: 更新 `/admin` 权限分支与全局样式**

  有分析权限渲染大屏；其他角色保留轻量统计。新增 `:fullscreen`、打印和减少动画样式，不改变后台其余页面画布。

- [ ] **Step 6: 运行交互测试确认通过**

  Run: `npx vitest run tests/unit/admin/global-intelligence-dashboard.test.tsx tests/unit/admin/analytics-dashboard.test.tsx`
  Expected: PASS.

- [ ] **Step 7: 提交**

  Commit: `feat(admin): launch global intelligence dashboard`

### Task 4: 询盘、搜索、健康状态与下钻

**Files:**
- Create: `components/admin/dashboard/InquiryPulse.tsx`
- Create: `components/admin/dashboard/SearchPerformance.tsx`
- Create: `components/admin/dashboard/DataSourceHealth.tsx`
- Modify: `components/admin/dashboard/GlobalIntelligenceDashboard.tsx`
- Modify: `tests/unit/admin/global-intelligence-dashboard.test.tsx`

**Interfaces:**
- Consumes: CRM DTO、Search Console 报表、`IntegrationSourceState`、后台详情 URL。
- Produces: 授权询盘跟进、关键词机会、热门页面和数据健康下钻区域。

- [ ] **Step 1: 编写失败测试**

  覆盖询盘权限隐藏、国家中文化、Google 未连接状态、搜索数据不足和详情链接。

- [ ] **Step 2: 运行测试确认失败**

  Run: `npx vitest run tests/unit/admin/global-intelligence-dashboard.test.tsx`
  Expected: FAIL on missing inquiry/search/health regions.

- [ ] **Step 3: 实现询盘、搜索和健康模块**

  只显示 DTO 返回字段；Search Console 未连接或数据不足时显示状态和 `/admin/analytics` 接入入口。

- [ ] **Step 4: 运行测试确认通过**

  Run: `npx vitest run tests/unit/admin/global-intelligence-dashboard.test.tsx`
  Expected: PASS.

- [ ] **Step 5: 提交**

  Commit: `feat(admin): add dashboard intelligence modules`

### Task 5: 浏览器视觉验收与完整回归

**Files:**
- Modify: `tests/e2e/admin-auth.spec.ts`
- Create: `tests/e2e/admin-dashboard.spec.ts`
- Modify: `docs/superpowers/plans/2026-11-17-global-intelligence-dashboard.md`

**Interfaces:**
- Consumes: Tasks 1–4 的完整 `/admin` 大屏。
- Produces: 通过桌面、平板、移动端和 Preview 验收的交付分支。

- [ ] **Step 1: 编写 E2E 断言**

  登录后检查十个核心区域、日期切换、刷新、国家筛选、全屏入口、导出权限和未登录 API 保护。

- [ ] **Step 2: 运行目标 E2E**

  Run: `npm run test:e2e -- tests/e2e/admin-auth.spec.ts tests/e2e/admin-dashboard.spec.ts`
  Expected: PASS using the guarded `_test` database only.

- [ ] **Step 3: 运行全部验证**

  Run: `npm test`
  Expected: all unit tests PASS.

  Run: `npm run test:integration`
  Expected: all integration tests PASS using `.env.test`.

  Run: `npm run typecheck`
  Expected: exit 0.

  Run: `npm run lint`
  Expected: exit 0.

  Run: `npm run build`
  Expected: exit 0 and all admin routes emitted.

- [ ] **Step 4: 浏览器视觉核验**

  对 1920×1080、1440×900、1366×768、390×844 截图；检查概念图与实现的标题、首屏构图、配色、容器、图表、表格和响应式，修复所有可见偏差。

- [ ] **Step 5: 部署 Preview 并验收**

  Run: `npx vercel deploy --yes`
  Expected: Preview `READY`; 首页、后台登录、数据总览和未登录 API 鉴权正常。

- [ ] **Step 6: 提交、推送并请求生产授权**

  Commit: `test(admin): verify intelligence dashboard`

  Push: `git push origin codex/global-intelligence-dashboard`

  未获得本次大屏的明确生产授权前，不运行 `vercel --prod`。
