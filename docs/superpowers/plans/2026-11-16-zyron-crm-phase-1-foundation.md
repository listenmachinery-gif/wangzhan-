# ZYRON CRM Phase 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不破坏现有 Lead 数据、URL 和 API 的前提下，交付公司/联系人、12 阶段销售流程、团队数据范围、手动询盘、升级后的询盘列表与详情，以及可安全审查的回填工具。

**Architecture:** 保留 `Lead` 作为询盘核心实体，通过可空外键连接新增 `Company`、`Contact`、`CrmStage` 和团队模型。旧 `/admin/leads` 与 Lead API 和新 `/admin/inquiries` 接口共享同一服务层；阶段服务负责新阶段与旧 `LeadStatus` 的双向兼容，数据范围服务负责管理员、个人和团队查询过滤。

**Tech Stack:** Next.js 15 App Router、React 19、TypeScript 5.7、Prisma 7.10、PostgreSQL、Zod 4、Vitest、Testing Library、Playwright、Tailwind CSS 3、Vercel。

**Spec:** `docs/superpowers/specs/2026-11-16-zyron-crm-progressive-normalization-design.md`

## Global Constraints

- 保留现有 `Lead` 主键、询盘数据、产品/访客/聊天关联、`/admin/leads` URL 和现有 Lead API。
- 第一阶段数据库变更只新增表、索引、枚举和可空字段；不删除、重命名或改为非空任何生产列。
- `Lead.email` 在本阶段继续必填；WhatsApp-only 询盘留到第三阶段的独立迁移。
- 不自动合并客户；重复识别只返回候选并由人工确认。
- 所有写接口执行同源校验、Zod 校验、资源级权限、乐观锁和审计日志。
- 日期以 UTC 持久化；界面按用户/业务时区显示。
- 不把客户个人资料发送到 GA4 或普通分析事件。
- 不运行 `prisma migrate reset`、生产 `prisma migrate dev`、生产回填或任何破坏性数据库操作。
- 生产迁移必须先备份、在 Preview 克隆数据库验证，并在执行前再次取得明确授权。
- 每个任务都先写失败测试，再实现最小代码，测试通过后只提交该任务涉及的文件。

## Review Focus

- 同一联系人关联不同销售的询盘时，只返回当前用户有权限的询盘、活动和汇总；Task 4 的集成测试必须固定此行为。
- 旧 API 提交 `LOST` 未提供原因时，使用 `LEGACY_API_NO_REASON` 并写阶段历史；Task 3 的兼容测试必须固定此行为。
- 旧状态与当前细分阶段属于同一兼容组时，不得把细分阶段降级；Task 3 的映射测试必须固定此行为。
- 手动创建相同邮箱或相似公司时，只返回重复候选，不自动复用或合并记录；Task 5 的服务测试必须固定此行为。
- 无团队、过期团队成员或已转交询盘不得通过列表、详情、导出或客户汇总泄露；Task 2、Task 4 和 Task 5 的权限测试必须固定此行为。

---

## File Structure

### Data and domain

- `prisma/schema.prisma`：新增 CRM 枚举、公司、联系人、阶段、阶段历史、团队关系及 Lead 可空扩展字段。
- `prisma/migrations/20261116210000_crm_foundation/migration.sql`：与 schema 一致的纯增量迁移和默认阶段数据。
- `prisma/seed-crm.ts`：幂等补齐 12 个不可变阶段代码及默认展示配置。
- `lib/crm/stages.ts`：阶段常量、双向兼容映射和终态规则。
- `lib/crm/normalization.ts`：公司名称、邮箱和电话候选标准化。
- `lib/services/crm-access-service.ts`：把 Principal 和团队关系解析为数据库查询范围。
- `lib/services/crm-stage-service.ts`：在事务中更新阶段、旧状态、历史和审计。
- `lib/services/customer-service.ts`：公司/联系人创建、更新、列表、详情和重复候选。
- `lib/services/lead-service.ts`：复用现有 Lead 服务，增加新筛选、手动创建、联系人关联和阶段能力。

### Validation and HTTP

- `lib/validation/crm.ts`：客户、公司、手动询盘、阶段、分页和筛选 schema。
- `lib/http/crm-response.ts`：CRM 统一 400/401/403/404/409/500 响应。
- `app/api/admin/inquiries/**`：新询盘接口，调用共享 Lead 服务。
- `app/api/admin/customers/**`：客户接口，调用 Customer 服务。
- `app/api/admin/crm/stages/route.ts`：返回启用阶段。
- `app/api/admin/leads/**`：保持路径和响应兼容，内部改用共享阶段/范围逻辑。

### Admin UI

- `components/admin/crm/InquiryList.tsx`：筛选、表格、分页与空状态。
- `components/admin/crm/InquiryDetail.tsx`：三栏询盘详情基础视图和阶段/负责人操作。
- `components/admin/crm/ManualInquiryForm.tsx`：手动询盘表单和重复候选提示。
- `components/admin/crm/CustomerList.tsx`：联系人列表、筛选和数据范围展示。
- `components/admin/crm/CustomerDetail.tsx`：基础资料与当前用户可见询盘汇总。
- `components/admin/crm/CustomerForm.tsx`：新增/编辑联系人和公司。
- `app/admin/leads/**` 与 `app/admin/inquiries/**`：旧、新 URL 共享页面组件。
- `app/admin/customers/**`：客户列表、新建和详情页。
- `components/admin/AdminSidebar.tsx`：在“客户增长”中增加询盘和客户入口。

### Migration and verification

- `scripts/backfill-crm-foundation.ts`：默认 dry-run、可重跑、有批次和恢复点的候选回填工具。
- `lib/db/test-database.ts`：按外键顺序清理新增测试表。
- `tests/unit/crm/**`：映射、验证、权限和 UI 单元测试。
- `tests/integration/crm/**`：数据库、服务、兼容和数据范围测试。
- `tests/e2e/admin-leads.spec.ts`：保留旧路径流程并增加新询盘/客户流程。

### Phase 1 Scope Boundary

本计划只交付设计文档的阶段 1，并为后续阶段提供稳定接口。结构化跟进修订、任务/提醒、前台 WhatsApp-only 与多产品需求、报价/PDF、Pipeline/报表、私有附件和第三方集成分别在阶段 2–6 的独立计划中实现；本阶段不得用占位 UI 或假数据模拟这些功能已完成。

---

### Task 1: Additive CRM foundation schema and default stages

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20261116210000_crm_foundation/migration.sql`
- Create: `prisma/seed-crm.ts`
- Modify: `package.json`
- Modify: `scripts/vercel-build.ts`
- Modify: `lib/db/test-database.ts`
- Create: `tests/integration/crm/foundation-schema.test.ts`

**Interfaces:**
- Consumes: Existing `User`, `Lead`, `AuditLog` and PostgreSQL migration workflow.
- Produces: Prisma models `Company`, `Contact`, `CrmStage`, `LeadStageHistory`, `CrmTeam`, `CrmTeamMembership`; `seedCrmStages(database: PrismaClient): Promise<void>`; nullable Lead CRM fields.

- [ ] **Step 1: Write the failing foundation schema integration test**

Add tests named `creates_all_default_stages_idempotently`, `keeps_legacy_lead_fields_unchanged`, and `allows_crm_relations_to_remain_null`. Assert exactly 12 active stage codes in the specified order, calling `seedCrmStages` twice leaves 12 rows, and a legacy Lead with only `email` and `message` still inserts.

- [ ] **Step 2: Run the schema test to verify it fails**

Run: `npm run test:integration -- tests/integration/crm/foundation-schema.test.ts`

Expected: FAIL because CRM models and `seedCrmStages` do not exist.

- [ ] **Step 3: Add the Prisma enums and models**

Add `CrmRecordOrigin`, `CrmSourceChannel`, `CustomerLevel`, and `CrmTeamMembershipRole`. Add all models and fields from spec §§5–6 and §14. Keep every new Lead foreign key and business field nullable; keep `Lead.email String` unchanged. Use `onDelete: SetNull` for optional owner/creator/updater/Lead links and `Restrict` for immutable history references.

- [ ] **Step 4: Add the pure additive SQL migration**

Create enums, tables, indexes, foreign keys and nullable Lead columns only. Insert the 12 default stage records with stable IDs `crm_stage_<lowercase-code>`. Do not update any existing Lead rows in the migration.

- [ ] **Step 5: Implement the idempotent stage seed**

Export `seedCrmStages(database: PrismaClient): Promise<void>` from `prisma/seed-crm.ts`. Upsert each immutable code while updating only display name, position, color, active/terminal/reason flags.

- [ ] **Step 6: Wire safe seeding into existing commands**

Add `db:seed:crm` to `package.json`. In `scripts/vercel-build.ts`, run `prisma/seed-crm.ts` only inside the existing approved production migration gate, immediately after `prisma migrate deploy`; do not weaken either gate variable.

- [ ] **Step 7: Update test database cleanup order**

Delete stage history and CRM relations before Lead/User rows, then delete stages and teams. Keep the existing `_test` and exact URL safety checks unchanged.

- [ ] **Step 8: Generate Prisma Client and run the test**

Run: `npm run db:generate && npm run test:integration -- tests/integration/crm/foundation-schema.test.ts`

Expected: PASS with 12 stages and a valid legacy Lead.

- [ ] **Step 9: Verify the migration contains no destructive SQL**

Run: `rg -n 'DROP|TRUNCATE|DELETE FROM|ALTER COLUMN.*NOT NULL|RENAME' prisma/migrations/20261116210000_crm_foundation/migration.sql`

Expected: no output.

- [ ] **Step 10: Commit the foundation**

```bash
git add prisma/schema.prisma prisma/migrations/20261116210000_crm_foundation/migration.sql prisma/seed-crm.ts package.json package-lock.json scripts/vercel-build.ts lib/db/test-database.ts tests/integration/crm/foundation-schema.test.ts
git commit -m "feat(crm): add additive customer and stage foundation"
```

### Task 2: Team-aware CRM data scope and permissions

**Files:**
- Modify: `lib/auth/permissions.ts`
- Create: `lib/services/crm-access-service.ts`
- Modify: `prisma/seed-rbac.ts`
- Create: `tests/unit/crm/access-scope.test.ts`
- Modify: `tests/unit/auth/permissions.test.ts`
- Create: `tests/integration/crm/team-scope.test.ts`

**Interfaces:**
- Consumes: `CrmTeamMembership`, existing `Principal`, `can()` and Lead assignments.
- Produces: `CrmAccessScope = { kind: "ALL" } | { kind: "ASSIGNEES"; assigneeIds: string[] } | { kind: "NONE" }`; `resolveCrmAccessScope(database: PrismaClient, principal: Principal, now?: Date): Promise<CrmAccessScope>`; `leadWhereForScope(scope): Prisma.LeadWhereInput`.

- [ ] **Step 1: Write failing role and scope tests**

Assert `SALES_MANAGER` receives team-read/update/export and team-assignment permissions, `CRM_VIEWER` receives team-read only, Sales remains self-assigned only, and editor roles receive none. Assert expired memberships and teams without the principal produce `NONE` or self-only as appropriate.

- [ ] **Step 2: Run permission tests to verify failure**

Run: `npm test -- tests/unit/auth/permissions.test.ts tests/unit/crm/access-scope.test.ts`

Expected: FAIL because the new roles, permissions and access service are missing.

- [ ] **Step 3: Extend role and permission constants**

Add role keys `SALES_MANAGER` and `CRM_VIEWER`. Add explicit team-scoped Lead permissions plus the spec's customer/inquiry permissions. Preserve all current role grants; never give CRM viewer export, update, internal-note or restricted-attachment access.

- [ ] **Step 4: Implement team scope resolution**

Implement the exported signatures above. `SUPER_ADMIN`/`ADMIN` resolve to `ALL`; `SALES_MANAGER` and `CRM_VIEWER` resolve to active team member IDs; Sales resolves to its own ID; no CRM permission resolves to `NONE`. Active means `startsAt <= now` and `endsAt IS NULL OR endsAt > now`.

- [ ] **Step 5: Write the failing database scope test**

Create two teams, two sales users, one manager, one viewer and an expired membership. Assert the manager/viewer see only active-team assigned Leads, Sales sees only its own, and the expired user cannot see team data.

- [ ] **Step 6: Run the database scope test to verify failure**

Run: `npm run test:integration -- tests/integration/crm/team-scope.test.ts`

Expected: FAIL until the scope query uses active memberships and current assignments.

- [ ] **Step 7: Complete database-backed scope filtering and RBAC seeding**

Make `leadWhereForScope` filter only `LeadAssignment.endedAt = null`. Keep permission seed idempotent and let role opening depend on seeded permissions.

- [ ] **Step 8: Run permission and scope tests**

Run: `npm test -- tests/unit/auth/permissions.test.ts tests/unit/crm/access-scope.test.ts && npm run test:integration -- tests/integration/crm/team-scope.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit data scope**

```bash
git add lib/auth/permissions.ts lib/services/crm-access-service.ts prisma/seed-rbac.ts tests/unit/auth/permissions.test.ts tests/unit/crm/access-scope.test.ts tests/integration/crm/team-scope.test.ts
git commit -m "feat(crm): enforce team-aware data scope"
```

### Task 3: Stage compatibility service and legacy API preservation

**Files:**
- Create: `lib/crm/stages.ts`
- Create: `lib/services/crm-stage-service.ts`
- Modify: `lib/services/lead-service.ts`
- Modify: `lib/validation/inquiries.ts`
- Create: `tests/unit/crm/stages.test.ts`
- Create: `tests/integration/crm/stage-transitions.test.ts`
- Modify: `tests/integration/leads/permissions.test.ts`

**Interfaces:**
- Consumes: `CrmStage`, `LeadStageHistory`, `LeadStatus`, existing Lead update transaction.
- Produces: `legacyStatusToDefaultStage(status: LeadStatus): CrmStageCode | null`; `stageToLegacyStatus(code: CrmStageCode): LeadStatus`; `transitionLeadStage(transaction, input): Promise<Lead>`.

- [ ] **Step 1: Write failing pure mapping tests**

Assert all mappings in spec §6, including `SPAM -> null`, `ORDER_CONFIRMED -> WON`, and the same compatibility group predicate for `CONTACTED` and `REQUIREMENT_CONFIRMED`.

- [ ] **Step 2: Run mapping tests to verify failure**

Run: `npm test -- tests/unit/crm/stages.test.ts`

Expected: FAIL because stage mapping functions do not exist.

- [ ] **Step 3: Implement immutable stage constants and mappings**

Export the exact 12-code `CrmStageCode` union, `DEFAULT_CRM_STAGES`, both mapping functions and `sameLegacyCompatibilityGroup(currentStage, requestedStatus): boolean`.

- [ ] **Step 4: Write failing transition integration tests**

Cover: new API LOST without reason rejects; legacy API LOST writes `LEGACY_API_NO_REASON`; a same-group legacy update preserves the detailed stage; cross-group change writes one history row; SPAM stores previous stage and excludes the record without deleting it; stale version returns conflict.

- [ ] **Step 5: Run transition tests to verify failure**

Run: `npm run test:integration -- tests/integration/crm/stage-transitions.test.ts`

Expected: FAIL until the shared transition service exists.

- [ ] **Step 6: Implement transactional stage transitions**

Define input `{ leadId; actorId; expectedVersion; stageCode?; legacyStatus?; reasonCode?; reasonNote?; source: "LEGACY_API" | "CRM_API" }`. In one serializable transaction validate version/permissions before calling, update stage and legacy status, write `LeadStageHistory`, increment Lead version, and write `AuditLog`.

- [ ] **Step 7: Route old Lead updates through the stage service**

Keep the old request schema and response fields. Only stage/status writes use the new transition service; existing `nextFollowUpAt` behavior remains unchanged until Phase 2.

- [ ] **Step 8: Run old and new compatibility tests**

Run: `npm test -- tests/unit/crm/stages.test.ts && npm run test:integration -- tests/integration/crm/stage-transitions.test.ts tests/integration/leads/permissions.test.ts`

Expected: PASS, including all pre-existing Lead status tests.

- [ ] **Step 9: Commit stage compatibility**

```bash
git add lib/crm/stages.ts lib/services/crm-stage-service.ts lib/services/lead-service.ts lib/validation/inquiries.ts tests/unit/crm/stages.test.ts tests/integration/crm/stage-transitions.test.ts tests/integration/leads/permissions.test.ts
git commit -m "feat(crm): add compatible sales stage workflow"
```

### Task 4: Company and contact service with scoped customer views

**Files:**
- Create: `lib/crm/normalization.ts`
- Create: `lib/validation/crm.ts`
- Create: `lib/services/customer-service.ts`
- Create: `tests/unit/crm/normalization.test.ts`
- Create: `tests/unit/crm/validation.test.ts`
- Create: `tests/integration/crm/customers.test.ts`

**Interfaces:**
- Consumes: `CrmAccessScope`, Company/Contact models and current Lead assignments.
- Produces: `CustomerService.list(principal, rawQuery)`; `get(principal, contactId)`; `create(principal, rawInput)`; `update(principal, contactId, rawInput)`; duplicate candidate types without automatic merge.

- [ ] **Step 1: Write failing normalization and validation tests**

Assert company whitespace/case normalization, lowercase email, blank optional values becoming null, max lengths, valid country codes, and rejection when a manual contact has neither email nor phone/WhatsApp.

- [ ] **Step 2: Run unit tests to verify failure**

Run: `npm test -- tests/unit/crm/normalization.test.ts tests/unit/crm/validation.test.ts`

Expected: FAIL because CRM normalization and validation modules are missing.

- [ ] **Step 3: Implement normalization and Zod schemas**

Export `normalizeCompanyName(value: string): string`, `normalizeEmail(value: string): string`, and `normalizePhoneCandidate(value: string): string`; export customer create/update/list schemas with strict objects and version validation.

- [ ] **Step 4: Write failing customer service integration tests**

Assert Admin can create/update; Sales can read shared basics only through an assigned Lead; non-owner Sales cannot edit; customer detail includes only authorized Leads; internal notes never cross scope; same normalized email/company returns candidates but creates no automatic relation; stale update conflicts.

- [ ] **Step 5: Run customer integration tests to verify failure**

Run: `npm run test:integration -- tests/integration/crm/customers.test.ts`

Expected: FAIL because CustomerService is missing.

- [ ] **Step 6: Implement CustomerService and explicit DTOs**

Use select objects rather than returning raw Prisma models. Return `internalNotes` only when `canEdit` is true. Calculate inquiry count, first/last inquiry and visible inquiry list from Leads filtered by the resolved scope; do not trust cached Contact aggregate fields for authorization.

- [ ] **Step 7: Run customer tests**

Run: `npm test -- tests/unit/crm/normalization.test.ts tests/unit/crm/validation.test.ts && npm run test:integration -- tests/integration/crm/customers.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit customer domain**

```bash
git add lib/crm/normalization.ts lib/validation/crm.ts lib/services/customer-service.ts tests/unit/crm/normalization.test.ts tests/unit/crm/validation.test.ts tests/integration/crm/customers.test.ts
git commit -m "feat(crm): add scoped company and contact management"
```

### Task 5: Manual inquiries, upgraded query service and API aliases

**Files:**
- Modify: `lib/services/lead-service.ts`
- Modify: `lib/services/inquiry-service.ts`
- Modify: `lib/validation/crm.ts`
- Create: `lib/http/crm-response.ts`
- Create: `app/api/admin/inquiries/route.ts`
- Create: `app/api/admin/inquiries/[id]/route.ts`
- Create: `app/api/admin/crm/stages/route.ts`
- Create: `app/api/admin/customers/route.ts`
- Create: `app/api/admin/customers/[id]/route.ts`
- Modify: `app/api/admin/leads/route.ts`
- Modify: `app/api/admin/leads/[id]/route.ts`
- Create: `tests/integration/crm/inquiries.test.ts`
- Create: `tests/unit/crm/routes.test.ts`

**Interfaces:**
- Consumes: CustomerService, stage service and CRM access scope.
- Produces: `LeadService.createManual(principal, rawInput)`; expanded `LeadService.list/get`; REST endpoints with old/new URL compatibility.

- [ ] **Step 1: Write failing manual inquiry integration tests**

Assert Admin/Sales Manager with permission can create an inquiry linked to existing or newly created Contact/Company; Sales without create permission is rejected; required email remains enforced; duplicate candidates are returned but not merged; inquiry number is unique; default stage is `NEW_INQUIRY`; initial `LeadStageHistory` and AuditLog records are created.

- [ ] **Step 2: Run inquiry integration tests to verify failure**

Run: `npm run test:integration -- tests/integration/crm/inquiries.test.ts`

Expected: FAIL because manual creation and new filters do not exist.

- [ ] **Step 3: Extend strict schemas and LeadService**

Add filters for stage, level, country, source, owner, created date and overdue-compatible fields. Implement `createManual` in one transaction; create new Contact/Company only when explicitly requested, never from a duplicate candidate automatically.

- [ ] **Step 4: Set CRM defaults for newly accepted public inquiries**

Keep public payload behavior unchanged. When default stage exists, set `recordOrigin=WEBSITE_FORM`, `sourceChannel=WEBSITE`, `stageId=NEW_INQUIRY` and create the initial stage history; suspicious submissions remain `SPAM` and store the pre-isolation stage. Do not create Contact/Company automatically in Phase 1.

- [ ] **Step 5: Write failing route tests**

Mock services and assert unauthenticated 401, cross-origin mutation 403, invalid payload 400, permission failure 403, missing 404, version conflict 409, creation 201, and that `/api/admin/leads` and `/api/admin/inquiries` call the same service methods.

- [ ] **Step 6: Run route tests to verify failure**

Run: `npm test -- tests/unit/crm/routes.test.ts`

Expected: FAIL because new routes and shared response mapper are absent.

- [ ] **Step 7: Implement shared CRM response mapping and routes**

Return explicit DTOs; never expose internal object keys, password/session data, unrestricted notes or storage paths. Keep old Lead route response fields used by the current UI.

- [ ] **Step 8: Pin team scope across every Lead read path**

Extend integration assertions so list, detail, CSV export and customer inquiry summaries all use `resolveCrmAccessScope`; verify an expired member and former assignee receive no rows. Verify team assignment can target only active members of the manager's own team.

- [ ] **Step 9: Run service and route tests**

Run: `npm test -- tests/unit/crm/routes.test.ts && npm run test:integration -- tests/integration/crm/inquiries.test.ts tests/integration/leads/permissions.test.ts`

Expected: PASS.

- [ ] **Step 10: Commit APIs**

```bash
git add lib/services/lead-service.ts lib/services/inquiry-service.ts lib/validation/crm.ts lib/http/crm-response.ts app/api/admin/inquiries app/api/admin/crm/stages app/api/admin/customers app/api/admin/leads tests/integration/crm/inquiries.test.ts tests/unit/crm/routes.test.ts
git commit -m "feat(crm): add manual inquiry and customer APIs"
```

### Task 6: Inquiry list, manual creation and preserved admin URLs

**Files:**
- Create: `components/admin/crm/InquiryList.tsx`
- Create: `components/admin/crm/ManualInquiryForm.tsx`
- Create: `components/admin/crm/InquiryListPage.tsx`
- Modify: `app/admin/leads/page.tsx`
- Create: `app/admin/inquiries/page.tsx`
- Create: `app/admin/inquiries/new/page.tsx`
- Modify: `components/admin/AdminSidebar.tsx`
- Create: `tests/unit/admin/crm-inquiry-list.test.tsx`
- Modify: `tests/unit/admin/navigation.test.tsx`

**Interfaces:**
- Consumes: `LeadService.list`, customer candidates, stage list and existing admin UI primitives.
- Produces: Shared inquiry list page for both URLs and accessible manual inquiry form.

- [ ] **Step 1: Write failing inquiry UI tests**

Assert visible filters, fixed table labels, stage/level/source badges, empty state, pagination preserving filters, manual form validation, duplicate candidate warning, conflict message and success navigation to the created inquiry.

- [ ] **Step 2: Run UI tests to verify failure**

Run: `npm test -- tests/unit/admin/crm-inquiry-list.test.tsx tests/unit/admin/navigation.test.tsx`

Expected: FAIL because the CRM list components and routes do not exist.

- [ ] **Step 3: Implement responsive inquiry list using existing admin primitives**

Use `AdminPageHeader`, `TableShell`, `StatusBadge` and `DataState`. Keep semantic table markup, a caption, keyboard focus, horizontal overflow on small screens and Chinese operational copy. Do not duplicate server queries between `/admin/leads` and `/admin/inquiries`.

- [ ] **Step 4: Implement the manual inquiry form**

Group fields into customer, company, requirement and ownership sections. Submit to `/api/admin/inquiries`; show server duplicate candidates as a warning requiring explicit user choice before a second submission.

- [ ] **Step 5: Add URL sharing and navigation**

Make both list URLs render `InquiryListPage`. Keep `/admin/leads` working; use `/admin/inquiries` for the new sidebar label and provide “新增询盘” action.

- [ ] **Step 6: Run UI tests**

Run: `npm test -- tests/unit/admin/crm-inquiry-list.test.tsx tests/unit/admin/navigation.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit inquiry UI**

```bash
git add components/admin/crm/InquiryList.tsx components/admin/crm/ManualInquiryForm.tsx components/admin/crm/InquiryListPage.tsx app/admin/leads/page.tsx app/admin/inquiries components/admin/AdminSidebar.tsx tests/unit/admin/crm-inquiry-list.test.tsx tests/unit/admin/navigation.test.tsx
git commit -m "feat(crm): upgrade inquiry list and manual entry"
```

### Task 7: Three-column inquiry detail and customer workspace

**Files:**
- Create: `components/admin/crm/InquiryDetail.tsx`
- Create: `components/admin/crm/InquiryDetailPage.tsx`
- Create: `components/admin/crm/CustomerList.tsx`
- Create: `components/admin/crm/CustomerDetail.tsx`
- Create: `components/admin/crm/CustomerForm.tsx`
- Modify: `app/admin/leads/[id]/page.tsx`
- Create: `app/admin/inquiries/[id]/page.tsx`
- Create: `app/admin/customers/page.tsx`
- Create: `app/admin/customers/new/page.tsx`
- Create: `app/admin/customers/[id]/page.tsx`
- Create: `tests/unit/admin/crm-detail.test.tsx`
- Create: `tests/unit/admin/crm-customers.test.tsx`

**Interfaces:**
- Consumes: Lead/Customer DTOs, stage/assignment APIs and admin UI primitives.
- Produces: Shared inquiry detail for old/new URLs and scoped customer management pages.

- [ ] **Step 1: Write failing detail and customer UI tests**

Assert the detail renders contact/company, original inquiry, product snapshot, visible timeline, stage and owner; hides internal notes when DTO omits them; surfaces 409 reload guidance; customer detail lists only server-provided authorized inquiries; forms expose accessible labels and error summaries.

- [ ] **Step 2: Run UI tests to verify failure**

Run: `npm test -- tests/unit/admin/crm-detail.test.tsx tests/unit/admin/crm-customers.test.tsx`

Expected: FAIL because the new workspace components do not exist.

- [ ] **Step 3: Implement the three-column inquiry detail**

Desktop layout: left customer/requirement context, center original inquiry and timeline, right stage/owner/quick actions. Collapse to one column on mobile. Preserve current note creation in Phase 1; label it as a basic note until structured follow-up ships in Phase 2.

- [ ] **Step 4: Share the detail route without redirects**

Both `/admin/leads/[id]` and `/admin/inquiries/[id]` render `InquiryDetailPage`, preserving browser URLs and authorization behavior.

- [ ] **Step 5: Implement customer list, create and detail pages**

Render only fields present in scoped DTOs. Show duplicate candidates before creation, use version on updates, and display read-only state when `canEdit=false`.

- [ ] **Step 6: Add customer navigation**

Add “客户管理” under “客户增长” with `customer.read` permission; ensure unauthorized roles do not receive the item.

- [ ] **Step 7: Run UI tests**

Run: `npm test -- tests/unit/admin/crm-detail.test.tsx tests/unit/admin/crm-customers.test.tsx tests/unit/admin/navigation.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit CRM workspaces**

```bash
git add components/admin/crm/InquiryDetail.tsx components/admin/crm/InquiryDetailPage.tsx components/admin/crm/CustomerList.tsx components/admin/crm/CustomerDetail.tsx components/admin/crm/CustomerForm.tsx app/admin/leads/'[id]'/page.tsx app/admin/inquiries/'[id]'/page.tsx app/admin/customers components/admin/AdminSidebar.tsx tests/unit/admin/crm-detail.test.tsx tests/unit/admin/crm-customers.test.tsx tests/unit/admin/navigation.test.tsx
git commit -m "feat(crm): add inquiry and customer workspaces"
```

### Task 8: Safe dry-run CRM backfill

**Files:**
- Create: `scripts/backfill-crm-foundation.ts`
- Modify: `package.json`
- Create: `tests/integration/crm/backfill.test.ts`

**Interfaces:**
- Consumes: Existing Leads, default stages and normalization functions.
- Produces: `buildCrmBackfillPlan(database, options): Promise<CrmBackfillPlan>`; `applyCrmBackfillPlan(database, plan, options): Promise<CrmBackfillResult>`; CLI defaults to dry-run.

- [ ] **Step 1: Write failing backfill integration tests**

Assert dry-run performs zero writes; clear unique email/company candidates are planned; ambiguous records remain unlinked; stage mapping is included; repeat apply creates no duplicates; batch limit and resume cursor work; production apply without both existing production authorization variables is rejected.

- [ ] **Step 2: Run backfill tests to verify failure**

Run: `npm run test:integration -- tests/integration/crm/backfill.test.ts`

Expected: FAIL because the backfill module is missing.

- [ ] **Step 3: Implement plan generation**

The plan reports counts for Leads, stage mappings, clear contacts, clear companies, duplicates, incomplete rows and conflicts. It must contain stable source Lead IDs and never include secrets. For records created from backfill, derive deterministic entity IDs from the entity type plus the lexicographically smallest source Lead ID in the candidate group so reruns can upsert without adding a production-only marker column.

- [ ] **Step 4: Implement guarded apply**

Require `--apply`; use bounded transactions, upserts keyed by the deterministic entity IDs from Step 3, AuditLog rows and a resume cursor. In Production also require `ZYRON_PRODUCTION_CHANGE_AUTHORIZED=true` and `ALLOW_PRODUCTION_MIGRATIONS=approved-once`.

- [ ] **Step 5: Add npm command and run tests**

Add `db:backfill:crm` as `tsx scripts/backfill-crm-foundation.ts`. Run: `npm run test:integration -- tests/integration/crm/backfill.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit backfill tooling**

```bash
git add scripts/backfill-crm-foundation.ts package.json package-lock.json tests/integration/crm/backfill.test.ts
git commit -m "feat(crm): add guarded customer backfill tooling"
```

### Task 9: Full regression, browser workflow and Preview readiness

**Files:**
- Modify: `tests/e2e/admin-leads.spec.ts`
- Create: `docs/crm/phase-1-preview-checklist.md`

**Interfaces:**
- Consumes: All Phase 1 interfaces and existing test/deployment commands.
- Produces: End-to-end regression coverage and a no-secret Preview acceptance checklist.

- [ ] **Step 1: Extend the E2E test before implementation verification**

Cover the existing public inquiry → old `/admin/leads` flow, new `/admin/inquiries` list/detail, manual inquiry creation, customer creation/linking, Sales self scope, manager team scope, viewer read-only scope, stale conflict message and unauthorized 401/403 behavior.

- [ ] **Step 2: Run targeted E2E to expose remaining gaps**

Run: `npm run test:e2e -- tests/e2e/admin-leads.spec.ts`

Expected: PASS only after all Phase 1 behavior is wired correctly; fix failures at their owning layer without weakening assertions.

- [ ] **Step 3: Run all required local checks**

Run in order:

```bash
npm ci
npm run db:generate
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run test:e2e
npm run build
```

Expected: every command exits 0. Tests must use `.env.test` and a database name ending in `_test`; do not substitute Production credentials.

- [ ] **Step 4: Inspect change safety**

Run: `git diff --check && git status --short && git diff --stat HEAD~9..HEAD`

Expected: no secrets, `.env` files, build output or unrelated product-page design file in the change set.

- [ ] **Step 5: Write the Preview checklist**

Document migration apply to a Preview database, `seed-crm`, dry-run backfill report review, old/new route checks, role matrix, public inquiry creation, static asset check and rollback by keeping nullable fields/old UI compatible. Do not include credential values.

- [ ] **Step 6: Verify the Vercel build locally**

After pulling Preview configuration into ignored files, run `vercel build` against Preview only. Expected: build succeeds without running Production migration or backfill gates.

- [ ] **Step 7: Commit verification assets**

```bash
git add tests/e2e/admin-leads.spec.ts docs/crm/phase-1-preview-checklist.md
git commit -m "test(crm): verify phase one workflows"
```

- [ ] **Step 8: Stop before Production mutation**

Create and validate a Preview deployment. Report its deployment ID, URL, test results and dry-run counts. Request separate authorization before applying the migration/backfill or promoting the change to Production.

---

## Phase 1 Exit Criteria

- Existing Lead records and public inquiry intake continue to work.
- Old and new admin URLs use the same secured services.
- Admin can create and manage customers and manual inquiries.
- Sales sees only currently assigned Leads; managers/viewers see only active-team data.
- Customer pages never reveal other salespeople's inquiry history or internal notes.
- Stage transitions preserve old status compatibility and complete history.
- Backfill defaults to dry-run and is idempotent when explicitly applied.
- Typecheck, lint, unit, integration, E2E, Next.js build and Preview deployment all pass.
- No Production database or domain change occurs without a new explicit authorization.
