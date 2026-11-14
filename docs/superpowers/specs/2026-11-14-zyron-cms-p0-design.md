# ZYRON CMS P0 Design

## Intent

Build ZYRON CMS inside the existing `zyroncnc.com` Next.js application so authorized Chinese-speaking staff can manage products, model specifications, banners, media, inquiries, and essential SEO without editing source code. Published database content must drive the existing English storefront while preserving every current public URL, layout contract, image reference, and search-engine signal.

## Goals

- Provide secure administrator login, server-enforced RBAC, session expiry, login throttling, and audit logs.
- Provide a responsive `/admin` application shell with Chinese navigation and permission-aware modules.
- Store product categories, products, model specifications, banners, media metadata, leads, and SEO records in PostgreSQL.
- Preserve all existing product and category slugs and continue rendering the existing public components.
- Persist every valid inquiry before attempting email notification, so SMTP failure cannot lose a lead.
- Provide draft, published, archived, ordering, validation, and safe-delete behavior where required.
- Support real object storage uploads with validated file type, size, ownership, and reference checks.
- Provide repeatable import and verification tooling for the current TypeScript product catalogue.
- Revalidate affected public pages, sitemap, and metadata after publishing.
- Verify each module with automated tests and a production build.

## Non-goals for P0

- Rebuilding or restyling the public website.
- Changing any current public URL or removing legacy redirects.
- Full page-builder, articles, cases, multilingual publishing, analytics, Search Console, marketing automation, or advanced SEO crawling; those remain P1/P2.
- Production deployment, production database migration, DNS changes, object-storage provisioning, or importing production data without explicit authorization.
- Inventing missing product specifications, media, leads, or analytics data.

## Anti-goals

- A static admin mock-up or browser-only authorization.
- Dual writes to database and TypeScript files as permanent architecture.
- Treating email delivery as inquiry persistence.
- Committing credentials, a default production password, or uploaded binary assets to Git.
- Broad refactoring of existing storefront components while introducing the CMS.

## Current System

- Next.js 15.5 App Router, React 19, TypeScript strict mode, Tailwind CSS 3, deployed through Vercel.
- Products, categories, technical specifications, redirects, sitemap entries, and much SEO content are assembled from `data/*.ts`.
- Public routes are statically generated under `/products/[id]` and `/products/series/[id]`; there are currently 53 product paths and 8 category paths.
- `/api/inquiry` validates a small set of fields and sends SMTP email, but does not persist inquiries or provide durable rate limiting.
- No database, ORM, authentication, RBAC, admin routes, or object-storage integration exists.
- Baseline TypeScript, ESLint, and production build pass on the feature branch.
- Pre-existing uncommitted small-electric-shear content and image changes are user-owned and must not be overwritten or included in CMS commits.

## Chosen Approach

### Selected: integrated Next.js application with PostgreSQL

Keep one deployable Next.js application. Add PostgreSQL through Prisma, server-side authentication, a normalized service layer, admin route handlers/server actions, and an S3-compatible object-storage adapter. Existing public components consume published records through a compatibility repository that maps database entities into their current view models. This minimizes storefront churn and gives database content a single authoritative path.

### Considered: Supabase platform bundle

Supabase could combine PostgreSQL, authentication, and storage and shorten provisioning. It was not selected because ZYRON needs application-specific roles, permissions, audit behavior, and portable server-side services; coupling all three concerns to one hosted platform would make the first migration easier but long-term replacement harder.

### Considered: separate headless CMS

A standalone CMS offers mature editing interfaces, but it creates a second application, a second deployment boundary, and more complex schema/permission integration. It also increases the risk of public-route and SEO divergence, so it conflicts with the requirement to extend the existing project.

## Architecture

### Application boundaries

- `app/admin`: authenticated Chinese admin pages and layouts. The root public layout must not wrap admin pages with the public header/footer; route groups or nested layouts will separate public and admin chrome without changing URLs.
- `app/api/admin`: authenticated JSON endpoints for admin mutations, uploads, and list queries when server actions are not suitable.
- `app/api/inquiry`: public lead intake; validation, anti-spam, durable rate limiting, database transaction, then best-effort notification.
- `lib/auth`: session creation, password verification, login throttling, CSRF-safe mutation rules, and permission guards.
- `lib/db`: one server-only Prisma client and transaction helpers.
- `lib/repositories`: database access and compatibility mapping into existing public product/category shapes.
- `lib/services`: publish workflows, slug protection, media lifecycle, lead activities, audit recording, and cache revalidation.
- `lib/validation`: shared Zod schemas used at server boundaries; browser validation is convenience only.
- `lib/storage`: S3-compatible interface and implementation configured for Cloudflare R2 or an equivalent service.
- `prisma`: schema, migrations, seed/bootstrap tooling, and repeatable legacy catalogue import.

No server secret or database client may enter a client component bundle.

### Database model

All mutable entities use stable UUID/CUID identifiers, UTC timestamps, foreign keys, indexes, and explicit status fields. Slugs are unique within their public namespace and existing slugs are protected from accidental edits after import.

Core tables:

- `User`, `Role`, `Permission`, `UserRole`, `RolePermission`, `Session`, `LoginAttempt`, `AuditLog`.
- `ProductCategory` with optional `parentId` to support series → type hierarchy without changing current category URLs.
- `Product`, `ProductSection`, `ProductModel`, `SpecificationTemplate`, `SpecificationField`, `SpecificationValue`, `ProductRelation`.
- `Banner` and device-specific `BannerMedia` references.
- `MediaAsset` and `MediaReference`.
- `Lead`, `LeadActivity`, `LeadAssignment`, and `LeadNotificationAttempt`.
- `SeoRecord` keyed by entity type/entity ID or an exact existing pathname.
- `SiteSetting` for non-secret CMS configuration.

Published content uses `DRAFT`, `PUBLISHED`, and `ARCHIVED` states plus `publishedAt`. Products, categories, banners, and SEO records use optimistic concurrency through an integer version or updated timestamp so an older browser cannot silently overwrite a newer edit. Archiving is preferred to hard deletion for public or referenced records.

### Authentication and authorization

- Email/password login with a memory-hard password hash and opaque, server-stored session token in a Secure, HttpOnly, SameSite cookie.
- Session expiry and revocation are checked server-side on every protected request.
- Login attempts are limited by normalized account identifier and client network key without revealing whether the account exists.
- Initial super-admin creation is an explicit CLI/bootstrap operation using environment input; no hardcoded account is seeded.
- Required roles: Super Admin, Admin, Product Editor, Content Editor, and Sales.
- Permissions are granular actions such as `product.read`, `product.write`, `product.publish`, `media.write`, `lead.read.assigned`, `lead.assign`, `seo.write`, and `user.manage`.
- Default role matrix: Super Admin has every permission, including role/security settings and administrator lifecycle; Admin manages and publishes all P0 content, media, SEO, and leads and may manage non-Super-Admin users, but cannot grant or modify Super Admin or security-critical settings; Product Editor manages categories, products, models, specifications, and their media and may publish those records, but cannot access leads, users, global SEO, or security settings; Content Editor manages banners, shared media, and page/product SEO but cannot change product/model data, leads, users, or security settings; Sales may read and update only currently assigned leads, add activities, and export only their authorized rows. Only Super Admin may change the role/permission definitions themselves.
- Every admin page load and mutation performs a server-side permission check. UI hiding mirrors permission state but never replaces enforcement.
- Sign-in/out, role changes, publish/archive/delete, lead assignment/status changes, media replacement/deletion, and SEO changes write audit records.

For P0, “2FA-ready” means the user schema and authentication service have an explicit disabled 2FA capability boundary, and the security settings page clearly labels 2FA as not configured. Enrollment, secrets, recovery codes, enforcement, and provider integration are deferred; no non-functional enrollment UI is presented.

### Public storefront compatibility and migration

- A repeatable importer reads current `data/products.ts` and linked detail files and upserts recognizable categories, products, slugs, models, parameter tables, media paths, and SEO fields.
- The importer records unmapped or ambiguous fields and never fabricates values.
- Import verification compares category count, product count, slug sets, legacy redirects, image references, and representative specification tables before accepting the migration.
- During local development and migration validation, the repository may use an explicit environment-controlled legacy fallback if the database has not been initialized. Production CMS activation requires the database and must fail visibly rather than silently serving stale files.
- Existing page components keep their current public presentation. Repository adapters provide the same view-model fields while page metadata, `generateStaticParams`, sitemap, and structured data move to published database records.
- Publishing calls path/tag revalidation for the exact product/category/home/sitemap paths affected. Draft preview uses an authenticated, expiring preview mechanism and never exposes draft records through normal public queries.

### Product and specification management

- Category and product lists support search, status/category filters, ordering, archive, and permission-gated batch status changes.
- Every product detail page converges on the current Small Electric Shearing Machine page layout. The CMS exposes one shared ordered module catalogue: responsive hero; product overview; multi-angle product showcase; machine-detail gallery; configuration/option carousel; material-range gallery; customer problems; solution positioning and fit; working process; applications; material/capability guidance; advantages; machine structure; technical specification table; model cards; industry gallery; model-selection guide; comparison; energy/cost comparison; workflow; manufacturer/support; FAQ; related links; and quote CTA/required information.
- Each module has a typed, server-validated content schema, visibility flag, and order. Repeatable cards, images, paragraphs, rows, and links are edited as structured items rather than opaque HTML. A product may hide an inapplicable or empty module, but the CMS does not invent content to fill it.
- Product-specific interactive tools such as the current small-electric model selector remain optional registered widgets associated with a product; arbitrary executable code cannot be authored in the CMS.
- Migration inventories every existing detail page and maps its real content into the closest shared module. Unmapped content is reported for review and remains available through a temporary compatibility path until explicitly resolved; the migration never silently drops or fabricates content.
- Existing imported slugs are immutable in P0. Redirect creation and deliberate slug mutation are deferred to P1, preventing P0 editors from changing current URLs.
- Models belong to one product. Specification templates define ordered fields and units; values belong to a model/field pair with uniqueness constraints.
- Specification import is transactional, validates headers, units, duplicate models, cell types, and row-level errors, and makes no changes when validation fails.
- Public parameter tables are generated from ordered database fields and models, retaining horizontal overflow behavior on small screens.

### Banner management

- Banners support draft/published/disabled states, schedule windows, ordering, text, CTA, mask, text placement, and optional video.
- Desktop media is required. Tablet and mobile media are independently editable and fall back to desktop when omitted. Publishing rejects invalid schedule order or a missing desktop asset.
- Multiple simultaneously active banners render as an ordered carousel; a single active banner renders without redundant carousel controls. Schedule filtering and ordering happen server-side.
- The existing home hero is adapted to consume active published banners while preserving its URL and surrounding layout.

### Media management

- Binary content is uploaded directly or through a signed server flow to S3-compatible object storage; metadata is committed only after successful verification.
- Allowed MIME types and maximum sizes are configured server-side. The service checks file signatures, not only extensions; SVG is sanitized, and executable content is rejected.
- Media tracks width, height, size, MIME, checksum, object key, alt text, category, uploader, and lifecycle state.
- Replacement creates a new version/reference target; it does not overwrite an object key that may be cached.
- Deletion is blocked while active references exist. Unreferenced deletion removes or tombstones metadata and queues object cleanup with audit evidence.
- Image optimization may use Next.js delivery and asynchronous derivative generation; lack of a derivative must not lose the original upload.

### Leads and CRM

- The public inquiry schema accurately maps existing general inquiry and small-electric selector payloads and accepts only documented fields and lengths.
- Anti-spam includes honeypot handling, durable rate limiting, payload limits, normalization, and duplicate signals. Honeypot and clearly automated submissions receive a generic response and are not persisted as sales leads; repeated or suspicious but potentially genuine submissions are persisted with `SPAM` status for manager review. Rate-limited requests are rejected without creating duplicate lead rows, while the limiter retains its own security event.
- A valid submission is saved to PostgreSQL first. Email notification happens afterward and records success/failure independently; the API can acknowledge durable receipt even when SMTP is unavailable.
- CRM list/detail supports search, country/product/status filters, assignment, status workflow, notes, follow-up time, and append-only activities. Statuses are `NEW`, `CONTACTED`, `IN_DISCUSSION`, `QUOTED`, `WON`, `LOST`, and `SPAM`; managers may move between statuses and reopen records, while Sales may advance or close only leads currently assigned to them.
- A lead has at most one current assignee plus immutable assignment history. Sales users see assigned leads; Admin and Super Admin can view and reassign all leads. Product and Content Editors have no lead access by default.
- CSV/XLSX export enforces the same row-level permissions as the list endpoint and protects spreadsheet cells from formula injection.

### Basic SEO management

- `SeoRecord` supports title, description, canonical URL, Open Graph fields, robots index setting, and an internal target keyword.
- P0 editing covers current public routes, products, categories, and homepage records. URL slug changes remain governed by the protected-slug workflow.
- Public metadata uses published SEO records with current hardcoded metadata as migration input/fallback during validation.
- Sitemap includes only published/indexable database content. `robots.txt` excludes `/admin` and protected APIs while retaining current public behavior.
- Product and breadcrumb structured data are generated from the same published records rendered on the page.

## Admin UX

- Chinese UI, desktop-first responsive shell, fixed/collapsible `#0B0D10` sidebar, `#76B900` accent, top bar, and accessible keyboard/focus states.
- P0 navigation: overview shell, Banner, product categories, products, model parameters, media, inquiries, SEO, users/roles, and system settings.
- Lists use server pagination and explicit empty/loading/error states. Forms show field-level validation, unsaved-change protection, save status, and conflict errors.
- Dashboard analytics are not fabricated; until P1 it shows only real operational counts available from the database and labels external analytics as unconnected.

## API and error contracts

- Admin mutations accept validated JSON or multipart metadata, require an authenticated permission, execute business changes and audit writes transactionally, and return stable error codes for unauthorized, forbidden, validation, conflict, referenced, and internal failures.
- List endpoints use bounded page sizes and allowlisted sorting/filtering fields.
- Sensitive errors are logged server-side with a request ID; responses do not expose stack traces, SQL, credentials, or account-existence details.
- Mutation requests use same-origin cookie protections and reject untrusted origins where applicable.

## Testing and verification

- Unit tests: validation, permission evaluation, slug rules, specification mapping, media policy, inquiry normalization, and SEO mapping.
- Database integration tests against an isolated PostgreSQL database: constraints, transactions, RBAC, publish/archive behavior, lead persistence before notification, import idempotency, and reference-protected media deletion.
- Route tests: login/session behavior, unauthorized/forbidden admin requests, validation errors, rate limiting, optimistic conflicts, and public inquiry responses.
- Component/browser tests for critical admin login, product publish, specification edit, banner publish, media reference warning, lead workflow, and SEO edit paths.
- Migration verification snapshots the existing slug set and representative public metadata/specification output before switching reads.
- After each module: targeted tests, full test suite, TypeScript, ESLint, and production build. Public URL and metadata smoke checks run against representative routes.

## Deployment and operations

- New environment variables will include `DATABASE_URL`, a migration/admin connection if required by the provider, session secrets, object-storage endpoint/bucket/access credentials, upload limits, and existing SMTP variables.
- `.env.example` contains placeholders only. Secrets remain in local/Vercel environment configuration.
- Development migrations and local seed/import are permitted. Production migration requires a reviewed migration plan, verified backup/restore procedure, maintenance/rollback decision, and explicit user authorization.
- Activation is staged: deploy schema-compatible code, run verified import, compare counts/slugs/output, enable database reads, then smoke-test. Rollback disables database reads and restores the prior deployment; destructive down migrations are not used as the first rollback mechanism.
- Production object storage, Vercel deployment, and first administrator bootstrap are outside current authorization.

## Risks and mitigations

- **SEO/URL regression:** protect imported slugs, snapshot routes/metadata, retain redirects, and compare generated sitemap before activation.
- **Static-to-dynamic performance regression:** keep published reads cacheable, use tags/path revalidation, add indexed queries, and avoid loading editor-only relations publicly.
- **Incomplete legacy mapping:** importer reports ambiguity and retains source fallback during validation; no guessed values.
- **Lost inquiries:** database transaction precedes notification; SMTP failures are recorded and retryable.
- **Permission leakage:** central server guards, row-level lead filters, and integration tests for every role boundary.
- **Media deletion/cache breakage:** immutable object keys, reference records, blocked referenced deletion, and audited cleanup.
- **Dirty working tree contamination:** CMS commits exclude the pre-existing small-electric-shear files and images unless the user later asks to integrate them.

## Acceptance criteria

- An explicitly bootstrapped administrator can sign in at `/admin`, receives a revocable expiring session, and sees only permitted modules/actions.
- Authorized users can create/edit/publish/archive products and categories without changing existing public slugs; published changes appear on the matching existing routes after revalidation.
- Authorized users can manage product models and ordered parameter values; the existing product page renders the database-backed table responsively.
- Authorized users can publish scheduled, device-specific banners and the existing homepage renders the correct active banner.
- Authorized users can upload approved files to configured object storage and cannot delete referenced media without resolving references.
- A valid existing public inquiry is stored even if notification delivery fails, appears in CRM, and follows assignment/status permissions.
- Authorized users can edit basic SEO for existing routes; published metadata, canonical, robots setting, structured data, and sitemap reflect the saved record.
- The legacy importer is idempotent and its verification reports matching product/category slug sets with no invented content.
- Targeted and full automated checks, TypeScript, ESLint, and production build pass before completion is claimed.
- No production environment or production data is changed without separate explicit authorization.
