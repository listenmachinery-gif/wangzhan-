# ZYRON Realtime Chat and CRM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent anonymous website chat, Vercel-native realtime delivery through Upstash Redis, a three-pane admin workspace, role-scoped assignments, and safe Lead linking.

**Architecture:** HTTP services own authorization, validation, idempotent persistence, and history synchronization; Vercel WebSocket Functions deliver bidirectional events; Upstash Redis Pub/Sub coordinates function instances and TTL-backed presence. PostgreSQL remains authoritative and clients resync by cursor after every reconnect.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma/PostgreSQL, `@vercel/functions`, Upstash Redis over TLS with `ioredis`, Zod, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-zyron-analytics-crm-realtime-design.md`

## Global Constraints

- The public widget is anonymous and does not require registration; name, email, and WhatsApp are optional.
- Never create a Lead with a fake or placeholder email; conversion requires a valid email under the current Lead schema.
- Persist messages before broadcast; Redis is never the only copy of a business message.
- No high-frequency PostgreSQL polling; reconnect uses cursor-based HTTP resync.
- WebSocket tokens are short-lived and scoped to one visitor/conversation or one authenticated admin.
- Preview and Production use different Redis namespaces/resources; secrets never enter Git or logs.

## Review Focus

- Duplicate/reordered delivery: repeated client message IDs and Redis fan-out must create/render one message in order (Task 3/4 tests).
- Cross-session access: one anonymous visitor must never fetch or subscribe to another conversation (Task 3/4 security tests).
- Reconnect/deploy rollover: clients must resync missed messages and continue after forced close (Task 4/5 tests).
- Assignment race: two agents assigning/responding concurrently must resolve deterministically and audit the change (Task 6 integration tests).
- Unavailable Redis: durable HTTP messaging remains safe, the UI reports degraded realtime, and no database polling loop starts (Task 4/7 tests).

---

### Task 1: Chat Schema, Roles, and Permissions

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20261116140000_realtime_chat/migration.sql`
- Modify: `lib/auth/permissions.ts`
- Modify: `prisma/seed-rbac.ts`
- Modify: `tests/unit/auth/permissions.test.ts`
- Modify: `tests/unit/prisma/seed-rbac-entrypoint.test.ts`
- Modify: `tests/integration/db/foundation.test.ts`

**Interfaces:**
- Consumes: Existing `User`, `Lead`, `AnalyticsVisitor`, `AnalyticsSession`, audit log, and RBAC seed.
- Produces: `ChatConversation`, `ChatMessage`, `ChatAssignment`; chat enums; roles `SUPPORT_AGENT`, `SUPPORT_SUPERVISOR`; chat permissions from the design.

- [ ] **Step 1: Write failing schema and permission tests**

Assert conversation/message/assignment relations and indexes, client-message uniqueness per conversation, nullable Lead link, agent assigned-only scope, supervisor all/assign scope, and idempotent RBAC seed.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- tests/unit/auth/permissions.test.ts tests/unit/prisma/seed-rbac-entrypoint.test.ts && npm run test:integration -- tests/integration/db/foundation.test.ts`  
Expected: FAIL because chat models/roles/permissions do not exist.

- [ ] **Step 3: Add schema, migration, RBAC constants, and seed mapping**

Use assignment history with one active assignment enforced transactionally; do not delete existing role grants.

- [ ] **Step 4: Apply test migration and verify GREEN**

Run: `npm run db:migrate:test && npm test -- tests/unit/auth/permissions.test.ts tests/unit/prisma/seed-rbac-entrypoint.test.ts && npm run test:integration -- tests/integration/db/foundation.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations lib/auth/permissions.ts prisma/seed-rbac.ts tests/unit/auth/permissions.test.ts tests/unit/prisma/seed-rbac-entrypoint.test.ts tests/integration/db/foundation.test.ts
git commit -m "feat: add chat schema and support permissions"
```

### Task 2: Realtime Configuration and Redis Adapter

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.env.example`
- Create: `lib/realtime/config.ts`
- Create: `lib/realtime/redis.ts`
- Create: `lib/realtime/protocol.ts`
- Create: `tests/unit/realtime/config.test.ts`
- Create: `tests/unit/realtime/protocol.test.ts`

**Interfaces:**
- Consumes: `UPSTASH_REDIS_URL`, `REALTIME_TOKEN_SECRET`, `REALTIME_ENABLED`, `VERCEL_ENV`.
- Produces: `getRealtimeConfig()`, `publishRealtimeEvent(channel, event)`, `subscribeRealtimeChannel(channel, handler)`, protocol schemas/version `1`.

- [ ] **Step 1: Write failing config/protocol tests**

Assert missing-secret behavior, environment-prefixed channels, disabled mode, allowed event types, payload size limits, and rejection of unknown fields.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- tests/unit/realtime/config.test.ts tests/unit/realtime/protocol.test.ts`  
Expected: FAIL because realtime modules do not exist.

- [ ] **Step 3: Add `ioredis` and implement adapter/protocol**

Use separate publish/subscriber connections, TLS URL, bounded reconnect backoff, no secret logging, and lazy connection so build does not contact Redis.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test -- tests/unit/realtime/config.test.ts tests/unit/realtime/protocol.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example lib/realtime tests/unit/realtime
git commit -m "feat: add realtime redis foundation"
```

### Task 3: Persistent Conversation and Message APIs

**Files:**
- Create: `lib/validation/chat.ts`
- Create: `lib/services/chat-service.ts`
- Create: `lib/auth/chat-token.ts`
- Create: `lib/http/chat-response.ts`
- Create: `app/api/chat/conversations/route.ts`
- Create: `app/api/chat/conversations/[id]/messages/route.ts`
- Create: `app/api/chat/token/route.ts`
- Create: `app/api/admin/chat/conversations/route.ts`
- Create: `app/api/admin/chat/conversations/[id]/messages/route.ts`
- Create: `tests/unit/chat/validation.test.ts`
- Create: `tests/unit/chat/routes.test.ts`
- Create: `tests/integration/chat/chat-service.test.ts`

**Interfaces:**
- Consumes: Task 1 models/permissions, analytics identity, Task 2 protocol.
- Produces: `ChatService.createOrResumeConversation`, `listMessages`, `sendVisitorMessage`, `sendAgentMessage`, `listAdminConversations`, and scoped token functions.

- [ ] **Step 1: Write failing service, security, and route tests**

Cover optional contact fields, 5,000-character text limit, plain-text storage, rate limit, honeypot, message idempotency, cursor sync, visitor ownership, assigned-agent scope, closed/spam behavior, and token expiry/tamper cases.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- tests/unit/chat/validation.test.ts tests/unit/chat/routes.test.ts && npm run test:integration -- tests/integration/chat/chat-service.test.ts`  
Expected: FAIL because chat service/routes do not exist.

- [ ] **Step 3: Implement service, token, response mapping, and HTTP routes**

Commit message and audit rows transactionally. Publish only after commit; if Redis publish fails, return persisted success with degraded realtime metadata.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- tests/unit/chat/validation.test.ts tests/unit/chat/routes.test.ts && npm run test:integration -- tests/integration/chat/chat-service.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/validation/chat.ts lib/services/chat-service.ts lib/auth/chat-token.ts lib/http/chat-response.ts app/api/chat app/api/admin/chat tests/unit/chat tests/integration/chat
git commit -m "feat: add persistent chat APIs"
```

### Task 4: Vercel WebSocket Gateway and Presence

**Files:**
- Create: `lib/realtime/gateway.ts`
- Create: `lib/realtime/presence.ts`
- Create: `app/api/realtime/route.ts`
- Create: `tests/unit/realtime/gateway.test.ts`
- Create: `tests/integration/realtime/redis-fanout.test.ts`

**Interfaces:**
- Consumes: Task 2 Redis/protocol and Task 3 chat token/service.
- Produces: authenticated subscriptions, typing/read/presence events, Redis multi-instance fan-out, and `resync.required` on reconnect/gap.

- [ ] **Step 1: Write failing gateway and fan-out tests**

Use fake sockets and isolated Redis namespace to cover authentication deadline, conversation authorization, two-instance delivery, duplicate event suppression, presence TTL, forced disconnect, Redis loss, and no token/message-body logging.

- [ ] **Step 2: Run unit/integration tests and verify RED**

Run: `npm test -- tests/unit/realtime/gateway.test.ts && npm run test:integration -- tests/integration/realtime/redis-fanout.test.ts`  
Expected: FAIL because gateway/presence do not exist or test Redis configuration is absent.

- [ ] **Step 3: Implement gateway, presence, and Vercel route**

Use Node runtime, `experimental_upgradeWebSocket()`, a conservative supported max duration, heartbeat/idle cleanup, bounded per-socket queues, and Redis namespacing.

- [ ] **Step 4: Run tests and verify GREEN or record infrastructure prerequisite**

Run: `npm test -- tests/unit/realtime/gateway.test.ts && npm run test:integration -- tests/integration/realtime/redis-fanout.test.ts`  
Expected: PASS with test Redis; if credentials are not yet provisioned, unit tests PASS and integration test is explicitly blocked—not silently skipped.

- [ ] **Step 5: Commit**

```bash
git add lib/realtime/gateway.ts lib/realtime/presence.ts app/api/realtime/route.ts tests/unit/realtime/gateway.test.ts tests/integration/realtime/redis-fanout.test.ts
git commit -m "feat: add vercel websocket chat gateway"
```

### Task 5: Public Chat Widget

**Files:**
- Create: `components/chat/PublicChatWidget.tsx`
- Create: `components/chat/useChatConnection.ts`
- Create: `components/chat/ChatComposer.tsx`
- Modify: `app/(site)/layout.tsx`
- Create: `tests/unit/chat/public-widget.test.tsx`
- Create: `tests/e2e/public-chat.spec.ts`

**Interfaces:**
- Consumes: Task 3 HTTP APIs and Task 4 WebSocket gateway.
- Produces: English-default “Chat With Us” launcher, anonymous optional contact form, history, typing/read/offline/reconnect UI, and mobile full-height sheet.

- [ ] **Step 1: Write failing widget and reconnect tests**

Assert keyboard/focus behavior, optional identity fields, optimistic-send reconciliation, duplicate prevention, offline queue, cursor resync, refresh persistence, reduced motion, and no analytics consent dependency.

- [ ] **Step 2: Run unit tests and verify RED**

Run: `npm test -- tests/unit/chat/public-widget.test.tsx`  
Expected: FAIL because widget does not exist.

- [ ] **Step 3: Implement widget, connection hook, and composer**

Keep messages plain text, expose explicit connection state, and avoid hiding site CTAs on small screens.

- [ ] **Step 4: Run unit and public chat E2E tests and verify GREEN**

Run: `npm test -- tests/unit/chat/public-widget.test.tsx && npm run test:e2e -- tests/e2e/public-chat.spec.ts`  
Expected: PASS in an environment with realtime enabled.

- [ ] **Step 5: Commit**

```bash
git add components/chat app/'(site)'/layout.tsx tests/unit/chat/public-widget.test.tsx tests/e2e/public-chat.spec.ts
git commit -m "feat: add website live chat widget"
```

### Task 6: Three-Pane Admin Chat and Assignment Workflow

**Files:**
- Create: `app/admin/chat/page.tsx`
- Create: `components/admin/chat/ChatWorkspace.tsx`
- Create: `components/admin/chat/ConversationList.tsx`
- Create: `components/admin/chat/AgentConversation.tsx`
- Create: `components/admin/chat/VisitorContextPanel.tsx`
- Create: `app/api/admin/chat/conversations/[id]/assignment/route.ts`
- Create: `app/api/admin/chat/conversations/[id]/status/route.ts`
- Create: `tests/unit/admin/chat-workspace.test.tsx`
- Create: `tests/integration/chat/assignment.test.ts`
- Create: `tests/e2e/admin-chat.spec.ts`

**Interfaces:**
- Consumes: chat list/message APIs, realtime gateway, visitor timeline, and chat permissions.
- Produces: `/admin/chat`, assigned/all queues, reply, typing/read, assign/transfer, close/reopen/spam, and linked visitor/Lead context.

- [ ] **Step 1: Write failing workspace, assignment-race, and E2E tests**

Assert three-pane desktop/two-step mobile behavior, unread counts, keyboard workflow, assigned-only enforcement, concurrent assignment conflict, transfer audit, real-time two-browser exchange, and closed/spam restrictions.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- tests/unit/admin/chat-workspace.test.tsx && npm run test:integration -- tests/integration/chat/assignment.test.ts`  
Expected: FAIL because admin workspace/assignment APIs do not exist.

- [ ] **Step 3: Implement workspace and transactional assignment/status routes**

The center pane is flexible, conversation rail is 280px, context panel is 340px; smaller layouts collapse progressively without losing actions.

- [ ] **Step 4: Run focused and E2E tests and verify GREEN**

Run: `npm test -- tests/unit/admin/chat-workspace.test.tsx && npm run test:integration -- tests/integration/chat/assignment.test.ts && npm run test:e2e -- tests/e2e/admin-chat.spec.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/admin/chat app/api/admin/chat/conversations components/admin/chat tests/unit/admin/chat-workspace.test.tsx tests/integration/chat/assignment.test.ts tests/e2e/admin-chat.spec.ts
git commit -m "feat: add admin live chat workspace"
```

### Task 7: Safe Lead Linking and Phase Verification

**Files:**
- Modify: `lib/services/chat-service.ts`
- Create: `app/api/admin/chat/conversations/[id]/lead/route.ts`
- Modify: `components/admin/chat/VisitorContextPanel.tsx`
- Create: `tests/integration/chat/lead-linking.test.ts`
- Modify: `tests/e2e/admin-chat.spec.ts`

**Interfaces:**
- Consumes: Existing Inquiry/Lead models and current `Lead.email` requirement.
- Produces: explicit create/link Lead operation, `LeadActivity`/audit entries, and context-panel links.

- [ ] **Step 1: Write failing Lead-linking tests**

Assert no conversion without valid email, normalized email matching, no duplicate Lead creation on retry, explicit link to an existing Lead, audit/activity creation, and permission enforcement.

- [ ] **Step 2: Run integration test and verify RED**

Run: `npm run test:integration -- tests/integration/chat/lead-linking.test.ts`  
Expected: FAIL because link API/service operation does not exist.

- [ ] **Step 3: Implement transactional Lead create/link operation and UI**

Do not modify existing Lead business data when linking unless the user explicitly submits the changed field.

- [ ] **Step 4: Run complete phase verification**

Run: `npm run typecheck && npm run lint && npm test && npm run test:integration && npm run build && npm run test:e2e -- tests/e2e/public-chat.spec.ts tests/e2e/admin-chat.spec.ts`  
Expected: all commands PASS with configured test Redis.

- [ ] **Step 5: Commit**

```bash
git add lib/services/chat-service.ts app/api/admin/chat/conversations/'[id]'/lead/route.ts components/admin/chat/VisitorContextPanel.tsx tests/integration/chat/lead-linking.test.ts tests/e2e/admin-chat.spec.ts
git commit -m "feat: link live chat with inquiry crm"
```

