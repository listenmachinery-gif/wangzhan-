# ZYRON 升级 Phase 1：导航与发货集锦实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将全站导航升级为草稿/发布/回滚的数据驱动配置，并上线使用真实数据的 Shipping Highlights 后台管理、前台列表、详情和首页联动。

**Architecture:** 复用现有 Prisma、RBAC、MediaAsset、AuditLog 和 PageService 的发布快照模式。`NavigationDocument` 保存一份 PRIMARY 草稿与已发布快照，无快照时使用代码默认导航；`ShippingHighlight` 保存草稿/发布快照和可索引的发布筛选字段，前台绝不读草稿。现有 `/cases` 继续存活，新导航指向 `/shipping-highlights`，本阶段不对旧页做无条件重定向。

**Tech Stack:** Next.js 15 App Router、React 19、TypeScript、Tailwind CSS、Prisma 7、PostgreSQL、Zod 4、Vitest、Testing Library、Playwright、Vercel。

**Spec:** `docs/superpowers/specs/2026-11-17-zyron-frontend-cms-comprehensive-upgrade-design.md`

## Global Constraints

- 不重建项目，不替换现有技术栈，不删除现有数据。
- 不改变任何现有产品 URL、Slug、询盘、CRM、WhatsApp、聊天或分析行为。
- 草稿不得改变公开网站；前台只读最后一次成功发布快照。
- 所有写 API 校验 Session、权限、同源、Zod Schema 和乐观版本。
- 多记录写入使用 Serializable 事务；Prisma `P2034` 映射为 HTTP 409。
- 发货内容不得包含客户联系方式、完整地址、物流单号或未授权身份信息。
- 国家使用 ISO 3166-1 alpha-2 代码存储，后台使用中文国名，英文前台使用英文国名。
- 无发布导航时必须回退默认导航；无真实发货记录时显示真实空状态，不生成演示数据。
- 不在构建时查询或修改生产数据库。
- 生产迁移、合并 `main` 和发布生产必须另行获得明确授权。

## Review Focus

- 已发布导航之后保存新草稿，公开 Header/Footer 仍显示旧快照；Task 4 集成测试覆盖。
- 发货记录修改国家、媒体或 Slug 后未发布，公开列表与详情不变；Task 8 集成测试覆盖。
- 过期版本并发保存、发布或回滚应返回 409，不丢失已发布快照；Task 4 和 Task 8 覆盖。
- 媒体不存在、已归档、类型不允许或图片缺少 alt 时阻止发货发布；Task 7 和 Task 8 覆盖。
- 数据库无导航或发货数据、数据损坏或临时不可用时，导航不空白、旧 `/cases` 不 404、首页不 500；Task 5、Task 9 和 Task 11 覆盖。

---

### Task 1: 建立导航文档 Schema 与默认兼容数据

**Files:**
- Create: `lib/navigation/schema.ts`
- Create: `lib/navigation/default-navigation.ts`
- Test: `tests/unit/navigation/schema.test.ts`

**Interfaces:**
- Produces: `NavigationSnapshot`, `NavigationNode`, `FooterNavigationGroup`, `LanguageNavigationLink`。
- Produces: `navigationSnapshotSchema: ZodSchema<NavigationSnapshot>` and `parseNavigationSnapshot(raw: unknown): NavigationSnapshot`。
- Produces: `DEFAULT_NAVIGATION: NavigationSnapshot`，其 PRIMARY 顺序固定为 HOME、ABOUT ZYRON、PRODUCTS、SUPPORT、CONTACT。
- Produces: `validateInternalHref(href: string): boolean`，接受 `/` 开头但拒绝 `//`、反斜杠和控制字符。

- [ ] **Step 1: Write failing schema tests**

  测试默认导航不包含 `Buying Guides`、`Customer Cases`、`SHOWCASE`，Support 子项精确为 Company News 和 Shipping Highlights，且非法外链、`//evil.test`、重复 ID、超过 3 层嵌套会校验失败。

- [ ] **Step 2: Run the targeted test and confirm RED**

  Run: `npm test -- tests/unit/navigation/schema.test.ts`

- [ ] **Step 3: Implement schema and immutable fallback snapshot**

  `NavigationSnapshot` 结构固定为 `{ schemaVersion: 1, primary: NavigationNode[], quote: NavigationNode, languages: LanguageNavigationLink[], footerGroups: FooterNavigationGroup[] }`。`NavigationNode.kind` 只允许 `LINK | PRODUCT_DIRECTORY | GROUP`，外部 URL 只允许 `https:`。

- [ ] **Step 4: Run the targeted test and confirm GREEN**

  Run: `npm test -- tests/unit/navigation/schema.test.ts`

- [ ] **Step 5: Commit**

  `git add lib/navigation tests/unit/navigation && git commit -m "feat: define managed site navigation schema"`

### Task 2: 新增导航与发货数据模型

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20261117170000_navigation_shipping_highlights/migration.sql`
- Modify: `tests/integration/db/foundation.test.ts`

**Interfaces:**
- Produces Prisma models: `NavigationDocument`, `NavigationVersion`, `ShippingHighlight`, `ShippingHighlightVersion`, `ShippingMedia`。
- Produces Prisma enum: `ShippingMediaRole { COVER LOADING EQUIPMENT VIDEO }`。
- `NavigationDocument.key` 唯一，Phase 1 只使用 `PRIMARY`；字段为 `status`、`draftContent`、`publishedContent`、`version`、`publishedVersion`、`publishedAt`、时间戳。
- `ShippingHighlight` 身份字段为 `slug @unique`、`slugLocked`、`status`、`version`、`draftContent`、`publishedContent`、`publishedVersion`、`publishedAt`；发布筛选字段为 `publishedShipmentDate`、`publishedCountryCode`、`publishedCategorySlug`。
- `ShippingHighlight` 草稿关系字段为 `categoryId?`、`productId?`、`coverMediaId?`，关联删除均使用 `Restrict` 或 `SetNull`，不级联删除产品/媒体。
- `ShippingMedia` 保存 `role`、`position`、`caption?`、`altText`，并以 `(shippingHighlightId, role, position)` 唯一。

- [ ] **Step 1: Extend the foundation integration test with table, index, FK, and delete-policy assertions**

- [ ] **Step 2: Run the database test and confirm RED**

  Run: `npm run test:integration -- tests/integration/db/foundation.test.ts`

- [ ] **Step 3: Add Prisma models and a forward-only migration**

  迁移只创建新表、索引和外键，不修改、删除或回填现有正式业务表。

- [ ] **Step 4: Validate and generate Prisma Client**

  Run: `npx prisma validate && npx prisma generate`

- [ ] **Step 5: Apply migration only to the isolated test database and confirm GREEN**

  Run: `npm run db:migrate:test && npm run test:integration -- tests/integration/db/foundation.test.ts`

- [ ] **Step 6: Commit**

  `git add prisma tests/integration/db/foundation.test.ts && git commit -m "feat: add navigation and shipping content models"`

### Task 3: 扩展 RBAC 与中文枚举显示

**Files:**
- Modify: `lib/auth/permissions.ts`
- Modify: `prisma/seed-rbac.ts`
- Modify: `lib/admin/localization.ts`
- Modify: `tests/unit/auth/permissions.test.ts`
- Modify: `tests/unit/prisma/seed-rbac-entrypoint.test.ts`
- Modify: `tests/unit/admin/localization.test.ts`

**Interfaces:**
- Produces permissions: `navigation.read | navigation.write | navigation.publish | shipping.read | shipping.write | shipping.publish`。
- `ADMIN` 获得全部新权限；`CONTENT_EDITOR` 获得 read/write/publish；其它现有角色默认不获得。
- Produces Chinese enum labels for `ShippingMediaRole`、`PublicationStatus` 和审计动作所需显示。

- [ ] **Step 1: Add failing permission and localization assertions**

- [ ] **Step 2: Run targeted unit tests and confirm RED**

  Run: `npm test -- tests/unit/auth/permissions.test.ts tests/unit/prisma/seed-rbac-entrypoint.test.ts tests/unit/admin/localization.test.ts`

- [ ] **Step 3: Add permissions, role mappings, seed behavior, and Chinese labels**

- [ ] **Step 4: Run targeted unit tests and confirm GREEN**

  Run: `npm test -- tests/unit/auth/permissions.test.ts tests/unit/prisma/seed-rbac-entrypoint.test.ts tests/unit/admin/localization.test.ts`

- [ ] **Step 5: Commit**

  `git add lib/auth lib/admin prisma/seed-rbac.ts tests/unit && git commit -m "feat: authorize navigation and shipping management"`

### Task 4: 实现导航发布服务、仓储与 API

**Files:**
- Create: `lib/services/navigation-service.ts`
- Create: `lib/repositories/navigation-repository.ts`
- Create: `lib/http/navigation-response.ts`
- Create: `app/api/admin/navigation/route.ts`
- Create: `app/api/admin/navigation/publish/route.ts`
- Create: `app/api/admin/navigation/versions/route.ts`
- Create: `app/api/admin/navigation/rollback/route.ts`
- Create: `tests/integration/navigation/navigation-service.test.ts`
- Create: `tests/unit/navigation/routes.test.ts`
- Create: `tests/unit/navigation/repository.test.ts`

**Interfaces:**
- Produces `NavigationService.get(principal)`、`saveDraft(principal, { version, document })`、`publish(principal, { version })`、`versions(principal)`、`rollback(principal, { version, targetVersion })`。
- Produces errors `NavigationPermissionError`、`NavigationNotFoundError`、`NavigationConflictError`、`NavigationValidationError`。
- Produces `getPublishedNavigation(database?): Promise<NavigationSnapshot | null>` and `resolvePublicNavigation(database?): Promise<NavigationSnapshot>`；后者在无记录或损坏快照时返回 `DEFAULT_NAVIGATION`。
- API: `GET/PATCH /api/admin/navigation`、`POST /publish`、`GET /versions`、`POST /rollback`。

- [ ] **Step 1: Write service integration tests**

  覆盖权限、首次 GET 提供默认草稿、保存版本、草稿隔离、发布、发布后继续保存草稿不改快照、回滚只生成新草稿、过期版本、`P2034`、审计日志和缓存刷新失败。

- [ ] **Step 2: Run service tests and confirm RED**

  Run: `npm run test:integration -- tests/integration/navigation/navigation-service.test.ts`

- [ ] **Step 3: Implement service and repository with Serializable transactions**

  发布后精确刷新 `/`、`/products`、`/factory`、`/news`、`/shipping-highlights`、`/contact`；刷新失败只记录错误，不否定已提交的发布。

- [ ] **Step 4: Run service tests and confirm GREEN**

  Run: `npm run test:integration -- tests/integration/navigation/navigation-service.test.ts`

- [ ] **Step 5: Write route authorization, same-origin, validation, 409 and error-redaction tests**

- [ ] **Step 6: Implement API routes and error mapper, then run route tests**

  Run: `npm test -- tests/unit/navigation/routes.test.ts tests/unit/navigation/repository.test.ts`

- [ ] **Step 7: Commit**

  `git add app/api/admin/navigation lib/services/navigation-service.ts lib/repositories/navigation-repository.ts lib/http/navigation-response.ts tests && git commit -m "feat: add versioned navigation publishing API"`

### Task 5: 把公开 Header、Mobile 和 Footer 接入已发布导航

**Files:**
- Modify: `app/(site)/layout.tsx`
- Modify: `components/SiteHeader.tsx`
- Modify: `components/SiteFooter.tsx`
- Create: `lib/repositories/site-navigation-view.ts`
- Create: `tests/unit/site/site-navigation.test.tsx`
- Modify: `tests/unit/site/privacy-page.test.tsx`

**Interfaces:**
- Produces `getSiteNavigationView(): Promise<{ navigation: NavigationSnapshot; categories: ProductCategory[]; products: Product[] }>`，优先使用已发布分类/产品，当数据库分类为空时使用现有 `data/products` 作兼容回退。
- `SiteHeader` 消费 `navigation`、`categories`、`products`；`SiteFooter` 消费 `navigation`，现有联系和隐私内容不变。

- [ ] **Step 1: Write render tests for desktop, mobile, support dropdown, product directory and footer**

  断言三处均不包含 Buying Guides、Customer Cases、SHOWCASE，并显示 Shipping Highlights；同时覆盖数据库无导航/无分类回退。

- [ ] **Step 2: Run targeted tests and confirm RED**

  Run: `npm test -- tests/unit/site/site-navigation.test.tsx tests/unit/site/privacy-page.test.tsx`

- [ ] **Step 3: Implement server-side navigation view and pass it through the site layout**

  `SiteLayout` 改为 async Server Component；数据查询仅发生在运行时渲染，不在模块顶层或构建脚本执行。

- [ ] **Step 4: Run targeted tests and confirm GREEN**

  Run: `npm test -- tests/unit/site/site-navigation.test.tsx tests/unit/site/privacy-page.test.tsx`

- [ ] **Step 5: Commit**

  `git add app/'(site)'/layout.tsx components/SiteHeader.tsx components/SiteFooter.tsx lib/repositories/site-navigation-view.ts tests/unit/site && git commit -m "feat: render published navigation across the public site"`

### Task 6: 实现导航管理界面

**Files:**
- Create: `app/admin/navigation/page.tsx`
- Create: `components/admin/navigation/NavigationEditor.tsx`
- Modify: `components/admin/AdminSidebar.tsx`
- Create: `tests/unit/admin/navigation-editor.test.tsx`
- Modify: `tests/unit/admin/navigation.test.tsx`

**Interfaces:**
- `NavigationEditor` 消费 `{ initialDocument, version, status, versions }`，提供顶级/子项的新增、删除、隐藏、键盘上下排序、标签与链接编辑、保存、发布、历史和回滚。
- 后台中文菜单在“内容运营”下新增“导航管理”，使用 `navigation.read`。

- [ ] **Step 1: Write failing component tests for edit, move, hide, save, publish, stale conflict and rollback**

- [ ] **Step 2: Run targeted tests and confirm RED**

  Run: `npm test -- tests/unit/admin/navigation-editor.test.tsx tests/unit/admin/navigation.test.tsx`

- [ ] **Step 3: Implement accessible editor and permission-gated sidebar item**

  拖拽可以延后到 Phase 4 统一编辑器；Phase 1 必须提供可测试的键盘上/下移动和层级编辑，不得只有静态表单。

- [ ] **Step 4: Run targeted tests and confirm GREEN**

  Run: `npm test -- tests/unit/admin/navigation-editor.test.tsx tests/unit/admin/navigation.test.tsx`

- [ ] **Step 5: Commit**

  `git add app/admin/navigation components/admin/navigation components/admin/AdminSidebar.tsx tests/unit/admin && git commit -m "feat: add managed navigation workspace"`

### Task 7: 建立发货内容 Schema、国家本地化与发布质量门

**Files:**
- Create: `lib/shipping/schema.ts`
- Create: `lib/shipping/countries.ts`
- Create: `tests/unit/shipping/schema.test.ts`
- Create: `tests/unit/shipping/countries.test.ts`

**Interfaces:**
- Produces `ShippingHighlightDocument` with exact fields: `title`, `summary`, `shipmentDate`, `countryCode`, `city?`, `categoryId?`, `categorySlug?`, `productId?`, `productSlug?`, `equipmentName`, `modelName?`, `quantity`, `containerMethod?`, `transportMode?`, `packagingMethod?`, `body`, `coverMediaId`, `media[]`, `seoTitle`, `seoDescription`.
- `media[]` item fields: `id`, `mediaAssetId`, `role: COVER | LOADING | EQUIPMENT | VIDEO`, `position`, `caption?`, `altText`.
- Produces `shippingHighlightDocumentSchema`、`parseShippingHighlightDocument`、`validateShippingPublication(document, assets): { blockers: string[]; warnings: string[] }`。
- Produces `getCountryName(code, "zh-CN" | "en"): string`、`countryOptionsZh`，基于现有 `i18n-iso-countries`。

- [ ] **Step 1: Write failing schema and country tests**

  覆盖 ISO 代码、中英文国名、数量下限、Slug 格式、必需封面、至少一项真实媒体、媒体 alt、SEO 长度、内部/外部 URL 和禁止敏感字段。

- [ ] **Step 2: Run targeted tests and confirm RED**

  Run: `npm test -- tests/unit/shipping/schema.test.ts tests/unit/shipping/countries.test.ts`

- [ ] **Step 3: Implement document schema, publication quality gate, and localized country helpers**

- [ ] **Step 4: Run targeted tests and confirm GREEN**

  Run: `npm test -- tests/unit/shipping/schema.test.ts tests/unit/shipping/countries.test.ts`

- [ ] **Step 5: Commit**

  `git add lib/shipping tests/unit/shipping && git commit -m "feat: validate shipping highlight content"`

### Task 8: 实现发货服务、版本、媒体引用和管理 API

**Files:**
- Create: `lib/services/shipping-highlight-service.ts`
- Create: `lib/http/shipping-response.ts`
- Create: `app/api/admin/shipping-highlights/route.ts`
- Create: `app/api/admin/shipping-highlights/[id]/route.ts`
- Create: `app/api/admin/shipping-highlights/[id]/publish/route.ts`
- Create: `app/api/admin/shipping-highlights/[id]/versions/route.ts`
- Create: `app/api/admin/shipping-highlights/[id]/rollback/route.ts`
- Create: `tests/integration/shipping/shipping-highlight-service.test.ts`
- Create: `tests/unit/shipping/routes.test.ts`

**Interfaces:**
- Produces `ShippingHighlightService.list/get/create/saveDraft/publish/archive/versions/rollback`。
- `create` 接受 `{ slug, document }`；`saveDraft` 接受 `{ version, slug?, document }`；`publish/archive` 接受 `{ version }`；`rollback` 接受 `{ version, targetVersion }`。
- Produces errors `ShippingPermissionError`、`ShippingNotFoundError`、`ShippingConflictError`、`ShippingValidationError`。
- API: `GET/POST /api/admin/shipping-highlights`、`GET/PATCH/DELETE /[id]`、`POST /publish`、`GET /versions`、`POST /rollback`。

- [ ] **Step 1: Write service integration tests**

  覆盖权限、草稿创建、Slug 唯一/首次发布后锁定、产品/分类真实性、媒体活性/类型/alt、媒体引用、草稿隔离、发布筛选字段、回滚、归档、过期版本、`P2034`、审计日志和缓存刷新容错。

- [ ] **Step 2: Run service tests and confirm RED**

  Run: `npm run test:integration -- tests/integration/shipping/shipping-highlight-service.test.ts`

- [ ] **Step 3: Implement service with one Serializable transaction per mutation**

  保存时同步 `ShippingMedia` 和草稿 `MediaReference`；发布时生成不可变快照、版本、发布 `MediaReference` 与可索引字段。回滚只创建新草稿，不改当前发布快照。

- [ ] **Step 4: Run service tests and confirm GREEN**

  Run: `npm run test:integration -- tests/integration/shipping/shipping-highlight-service.test.ts`

- [ ] **Step 5: Write and implement API route tests**

  覆盖 401、403、同源拒绝、400、404、409、未知错误脱敏 500。

- [ ] **Step 6: Run route tests**

  Run: `npm test -- tests/unit/shipping/routes.test.ts`

- [ ] **Step 7: Commit**

  `git add app/api/admin/shipping-highlights lib/services/shipping-highlight-service.ts lib/http/shipping-response.ts tests && git commit -m "feat: add shipping highlight publishing API"`

### Task 9: 实现发货公开仓储、列表、详情和首页联动

**Files:**
- Create: `lib/repositories/shipping-highlight-repository.ts`
- Create: `app/(site)/shipping-highlights/page.tsx`
- Create: `app/(site)/shipping-highlights/[slug]/page.tsx`
- Create: `components/shipping/ShippingHighlightCard.tsx`
- Create: `components/shipping/ShippingHighlightGallery.tsx`
- Create: `components/site/LatestShippingHighlights.tsx`
- Modify: `app/(site)/page.tsx`
- Modify: `app/sitemap.ts`
- Create: `tests/unit/shipping/repository.test.ts`
- Create: `tests/unit/shipping/public-pages.test.tsx`
- Modify: `tests/unit/seo/structured-data.test.tsx`

**Interfaces:**
- Produces `listPublishedShippingHighlights({ countryCode?, categorySlug?, sort?, limit?, cursor? })`、`getPublishedShippingHighlightBySlug(slug)`、`listLatestPublishedShippingHighlights(limit)`。
- 仓储只查询 `status=PUBLISHED`、`publishedAt != null`、`publishedContent != null`，并对快照 Schema 失败的记录跳过并记录结构化错误。
- 列表页查询参数只接受已知 ISO 国家代码、已发布分类 Slug 和 `newest | oldest`。

- [ ] **Step 1: Write repository tests for publication-only reads, filters, sort, pagination, malformed snapshots, and empty state**

- [ ] **Step 2: Run repository tests and confirm RED**

  Run: `npm test -- tests/unit/shipping/repository.test.ts`

- [ ] **Step 3: Implement repository and run repository tests GREEN**

- [ ] **Step 4: Write page rendering tests**

  覆盖列表筛选、中英文国名、空状态、详情 404、图集、用户触发视频、Product/Article/Breadcrumb 结构化数据、Canonical、首页最新三条与无数据不显示假卡片。

- [ ] **Step 5: Implement public pages and homepage section**

  前台媒体继续使用 `/api/media/{id}`；手机视频使用封面与 controls，不 autoplay。

- [ ] **Step 6: Run page and SEO tests GREEN**

  Run: `npm test -- tests/unit/shipping/public-pages.test.tsx tests/unit/seo/structured-data.test.tsx`

- [ ] **Step 7: Commit**

  `git add app/'(site)' app/sitemap.ts components/shipping components/site/LatestShippingHighlights.tsx lib/repositories/shipping-highlight-repository.ts tests/unit && git commit -m "feat: publish shipping highlights on the public site"`

### Task 10: 实现发货后台列表与编辑器

**Files:**
- Create: `app/admin/shipping-highlights/page.tsx`
- Create: `app/admin/shipping-highlights/new/page.tsx`
- Create: `app/admin/shipping-highlights/[id]/page.tsx`
- Create: `components/admin/shipping/ShippingHighlightList.tsx`
- Create: `components/admin/shipping/ShippingHighlightEditor.tsx`
- Modify: `components/admin/AdminSidebar.tsx`
- Create: `tests/unit/admin/shipping-highlight-list.test.tsx`
- Create: `tests/unit/admin/shipping-highlight-editor.test.tsx`
- Modify: `tests/unit/admin/navigation.test.tsx`

**Interfaces:**
- 列表支持关键字、状态、中文国名、产品分类和发货日期筛选。
- 编辑器消费真实媒体、分类、产品选项，提供基本信息、设备、物流/包装、媒体、正文、SEO、预览、版本、发布和归档。
- 后台菜单在“内容运营”下增加“发货集锦”，使用 `shipping.read`。

- [ ] **Step 1: Write failing list/editor tests**

  覆盖中文国家显示、空状态、产品与分类约束、媒体排序与 alt、保存、发布阻断项、版本冲突、回滚不改线上内容和归档二次确认。

- [ ] **Step 2: Run targeted tests and confirm RED**

  Run: `npm test -- tests/unit/admin/shipping-highlight-list.test.tsx tests/unit/admin/shipping-highlight-editor.test.tsx tests/unit/admin/navigation.test.tsx`

- [ ] **Step 3: Implement pages and accessible forms**

  文本输入不接受原始 HTML；正文使用受控结构化段落数组。发布后显示公开详情链接。

- [ ] **Step 4: Run targeted tests and confirm GREEN**

  Run: `npm test -- tests/unit/admin/shipping-highlight-list.test.tsx tests/unit/admin/shipping-highlight-editor.test.tsx tests/unit/admin/navigation.test.tsx`

- [ ] **Step 5: Commit**

  `git add app/admin/shipping-highlights components/admin/shipping components/admin/AdminSidebar.tsx tests/unit/admin && git commit -m "feat: add shipping highlight management workspace"`

### Task 11: 完成兼容、E2E 与响应式验收

**Files:**
- Create: `tests/e2e/admin-navigation.spec.ts`
- Create: `tests/e2e/admin-shipping-highlights.spec.ts`
- Create: `tests/e2e/public-navigation-shipping.spec.ts`
- Modify: `tests/e2e/p0-acceptance.spec.ts`
- Modify: `tests/e2e/public-product-parity.spec.ts`
- Modify: `docs/zyron-cms/p0-acceptance.md`

**Interfaces:**
- No new production interfaces; this task proves the Phase 1 contract end to end.

- [ ] **Step 1: Write E2E fixtures guarded to `_test` databases only**

  创建内容编辑员、真实测试媒体、已发布分类/产品和发货记录；清理仅删除本测试生成的 ID。

- [ ] **Step 2: Implement navigation E2E**

  登录 → 编辑草稿 → 公开站不变 → 发布 → 桌面/手机/Footer 更新 → 回滚为草稿 → 公开站仍不变。

- [ ] **Step 3: Implement shipping E2E**

  新建 → 选择媒体/产品 → 保存草稿 → 公开 404 → 发布 → 列表/详情/首页可见 → 草稿修改不改线上 → 再发布更新。

- [ ] **Step 4: Add public responsive and compatibility checks**

  1440px、768px、390px 检查无横向溢出、菜单可用、发货图集/视频可用；`/cases`、`/news`、全部现有产品 URL、Metadata 和询盘保持基线行为。

- [ ] **Step 5: Run targeted E2E**

  Run: `npm run test:e2e -- tests/e2e/admin-navigation.spec.ts tests/e2e/admin-shipping-highlights.spec.ts tests/e2e/public-navigation-shipping.spec.ts tests/e2e/public-product-parity.spec.ts tests/e2e/p0-acceptance.spec.ts`

- [ ] **Step 6: Commit**

  `git add tests/e2e docs/zyron-cms/p0-acceptance.md && git commit -m "test: verify navigation and shipping workflows"`

### Task 12: 完整验证、预览部署与交付报告

**Files:**
- Create: `docs/zyron-cms/phase-1-navigation-shipping-preview.md`
- Modify only if needed: `.vercelignore`

**Interfaces:**
- Produces a Preview acceptance report with deployment ID, commit SHA, routes, credentials handoff, migration status, screenshots, test results, known gaps, and explicit production steps.

- [ ] **Step 1: Review the full diff for unrelated changes, secrets, build output, and user-owned files**

  Run: `git status --short && git diff --check && git diff --stat origin/main...HEAD`

- [ ] **Step 2: Run Prisma validation and generation**

  Run: `npx prisma validate && npx prisma generate`

- [ ] **Step 3: Run all repository checks**

  Run: `npm run typecheck && npm run lint && npm test && npm run test:integration && npm run build`

- [ ] **Step 4: Run complete browser tests against the isolated test database**

  Run: `npm run test:e2e`

- [ ] **Step 5: Pull Preview environment safely and run Vercel's real build path**

  Run: `vercel pull --yes --environment=preview && vercel build`

  确认拉取的 `.vercel` 和环境文件被 Git 忽略，不输出密钥值。

- [ ] **Step 6: Deploy Preview and inspect deployment logs**

  Run: `vercel deploy --prebuilt`

  如果 Preview 需要数据库迁移，只向已确认的 Preview/测试数据库执行 `prisma migrate deploy`；任何不能证明非生产的 URL 都不执行迁移。

- [ ] **Step 7: Capture desktop, tablet, and mobile acceptance evidence**

  验证首页、产品页、Shipping Highlights 列表/详情、后台导航管理、发货编辑器、未登录 API 401 和无权限 403。

- [ ] **Step 8: Write the Preview report and commit**

  `git add docs/zyron-cms/phase-1-navigation-shipping-preview.md && git commit -m "docs: record phase one preview acceptance"`

- [ ] **Step 9: Stop before production**

  输出 Preview 地址、部署 ID、提交 SHA、测试结果、数据库迁移摘要、未完成项和生产所需人工操作，等待明确的生产迁移/发布授权。

## Self-Review Result

- Spec coverage: Phase 1 覆盖导航删除/改名、多端和 Footer 同步、导航数据源、Shipping Highlights 真实内容类型、后台 CRUD、前台列表/详情/首页、草稿/发布/回滚、SEO、媒体、权限、Preview 和生产门。产品自由页面、完整首页改版、多语言与 RedirectRule 属于后续独立 Phase 计划。
- Step scan: 每个任务完成一个可独立审查的产物，每个代码任务都先有失败测试、再有最小实现和精确验证。
- Type consistency: Navigation 和 Shipping 的文档、服务、仓储、API 和组件接口名称一致。
- Review Focus: 五项高风险输入都已指定具体所属测试任务。
- Proportion: 计划只固定接口、边界和验收，不内嵌实现函数体。
