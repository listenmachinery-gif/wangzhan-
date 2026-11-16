import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { normalizeCompanyName, normalizeEmail, normalizePhoneCandidate } from "../lib/crm/normalization";
import { legacyStatusToDefaultStage } from "../lib/crm/stages";
import { shouldRunProductionMigrations } from "../lib/deployment/production-migration-gate";

type Database = PrismaClient | Prisma.TransactionClient;
export type CrmBackfillOptions = { batchLimit?: number; cursor?: string };
export type CrmBackfillRow = {
  leadId: string;
  classification: "clear" | "incomplete" | "conflict";
  contactId: string | null;
  companyId: string | null;
  stageId: string | null;
  sourceFingerprint: string;
};
type Candidate = { id: string; sourceLeadIds: string[] };
export type CrmBackfillPlan = {
  batchLimit: number;
  cursor: string | null;
  nextCursor: string | null;
  hasMore: boolean;
  counts: { leads: number; stageMappings: number; clearContacts: number; clearCompanies: number; duplicates: number; incomplete: number; conflicts: number };
  rows: CrmBackfillRow[];
  contacts: Candidate[];
  companies: Candidate[];
};
export type CrmBackfillResult = { updatedLeads: number; nextCursor: string | null; hasMore: boolean; transactions: number };

// Identity-only projections deliberately exclude messages, notes, attribution and credentials.
const leadSelect = {
  id: true, name: true, email: true, company: true, country: true, phone: true, whatsapp: true,
  contactId: true, companyId: true, stageId: true, status: true, version: true,
} satisfies Prisma.LeadSelect;
type SourceLead = Prisma.LeadGetPayload<{ select: typeof leadSelect }>;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const entityId = (type: "contact" | "company", sources: SourceLead[]) => `crm_backfill_${type}_${hash(`${type}:${sources[0].id}`)}`;
const countryKey = (value: string | null) => value?.normalize("NFKC").trim().toUpperCase() ?? "";
const nameKey = (value: string | null) => normalizeCompanyName(value ?? "");
const companyKey = (row: SourceLead) => normalizeCompanyName(row.company ?? "");
const emailKey = (row: SourceLead) => normalizeEmail(row.email);
const complete = (row: SourceLead) => Boolean(nameKey(row.name) && companyKey(row) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailKey(row)));
function groupBy<T>(rows: T[], key: (row: T) => string) {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const value = key(row);
    const group = groups.get(value) ?? [];
    group.push(row);
    groups.set(value, group);
  }
  return groups;
}
function checkOptions(options: CrmBackfillOptions) {
  const batchLimit = options.batchLimit ?? 100;
  if (!Number.isInteger(batchLimit) || batchLimit < 1 || batchLimit > 500) throw new Error("Batch limit must be an integer from 1 to 500.");
  if (options.cursor !== undefined && (typeof options.cursor !== "string" || !options.cursor)) throw new Error("Cursor must be a nonempty Lead ID.");
  return batchLimit;
}

async function prepare(database: Database, options: CrmBackfillOptions) {
  const batchLimit = checkOptions(options);
  // Resolve identity across ALL source rows, including before/after the cursor. Limiting
  // these reads to one page could silently merge a conflicting email in a later page.
  const [leads, companies, contacts, stages] = await Promise.all([
    database.lead.findMany({ select: leadSelect }),
    database.company.findMany({ select: { id: true, normalizedName: true, name: true, countryCode: true } }),
    database.contact.findMany({ select: { id: true, normalizedEmail: true, email: true, fullName: true, companyId: true } }),
    database.crmStage.findMany({ where: { isActive: true }, select: { id: true, code: true } }),
  ]);
  // Use a locale-independent lexical order for IDs and cursor comparisons.
  leads.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const byEmail = groupBy(leads, emailKey);
  const byCompany = groupBy(leads, companyKey);
  const existingCompanies = groupBy(companies, row => normalizeCompanyName(row.normalizedName || row.name));
  const existingContacts = groupBy(contacts, row => normalizeEmail(row.normalizedEmail || row.email || ""));
  const stageByCode = new Map(stages.map(row => [row.code, row.id]));
  const companyCandidates = new Map<string, Candidate>();
  for (const [key, sources] of byCompany) {
    if (!key || new Set(sources.map(row => countryKey(row.country))).size > 1) continue;
    const matches = existingCompanies.get(key) ?? [];
    if (matches.length > 1) continue;
    if (matches[0]?.countryCode && countryKey(matches[0].countryCode) !== countryKey(sources[0].country)) continue;
    const id = matches[0]?.id ?? entityId("company", sources);
    if (companies.some(row => row.id === id && row.id !== matches[0]?.id)) continue;
    if (sources.some(row => row.companyId && row.companyId !== id)) continue;
    companyCandidates.set(key, { id, sourceLeadIds: sources.map(row => row.id) });
  }
  const contactCandidates = new Map<string, Candidate>();
  const classifications = new Map<string, CrmBackfillRow["classification"]>();
  for (const [email, sources] of byEmail) {
    // Any incomplete source or inconsistent identity makes the entire email group a review item.
    let classification: CrmBackfillRow["classification"] = sources.some(row => !complete(row)) ? "incomplete" : "clear";
    if (new Set(sources.map(companyKey)).size > 1 || new Set(sources.map(row => nameKey(row.name))).size > 1) classification = "conflict";
    const company = companyCandidates.get(companyKey(sources[0]));
    const matches = existingContacts.get(email) ?? [];
    if (classification === "clear" && (!company || matches.length > 1 || (matches[0] && (
      matches[0].companyId !== company.id || nameKey(matches[0].fullName) !== nameKey(sources[0].name)
    )))) classification = "conflict";
    const id = matches[0]?.id ?? entityId("contact", sources);
    if (contacts.some(row => row.id === id && row.id !== matches[0]?.id)) classification = "conflict";
    if (sources.some(row => row.contactId && row.contactId !== id)) classification = "conflict";
    if (classification === "clear") contactCandidates.set(email, { id, sourceLeadIds: sources.map(row => row.id) });
    classifications.set(email, classification);
  }
  const remaining = leads.filter(row => !options.cursor || row.id > options.cursor);
  const selected = remaining.slice(0, batchLimit);
  const selectedContacts = new Map<string, Candidate>();
  const selectedCompanies = new Map<string, Candidate>();
  let stageMappings = 0;
  const rows = selected.map(row => {
    const classification = classifications.get(emailKey(row))!;
    const contact = classification === "clear" ? contactCandidates.get(emailKey(row)) : undefined;
    const company = classification === "clear" ? companyCandidates.get(companyKey(row)) : undefined;
    if (contact) selectedContacts.set(contact.id, contact);
    if (company) selectedCompanies.set(company.id, company);
    const stageCode = legacyStatusToDefaultStage(row.status);
    const stageId = row.stageId ?? (stageCode ? stageByCode.get(stageCode) : null) ?? null;
    if (!row.stageId && stageCode && !stageId) throw new Error("A required active CRM stage is missing; seed and review stages before backfill.");
    if (!row.stageId && stageId) stageMappings++;
    return {
      leadId: row.id, classification, contactId: contact?.id ?? null, companyId: company?.id ?? null, stageId,
      sourceFingerprint: hash(JSON.stringify([row.name, row.email, row.company, row.country, row.phone, row.whatsapp, row.status])),
    };
  });
  const plan: CrmBackfillPlan = {
    batchLimit, cursor: options.cursor ?? null, nextCursor: selected.at(-1)?.id ?? options.cursor ?? null,
    hasMore: remaining.length > selected.length,
    counts: {
      leads: rows.length, stageMappings, clearContacts: selectedContacts.size, clearCompanies: selectedCompanies.size,
      duplicates: selected.filter(row => emailKey(row) && byEmail.get(emailKey(row))![0].id !== row.id).length,
      incomplete: rows.filter(row => row.classification === "incomplete").length,
      conflicts: rows.filter(row => row.classification === "conflict").length,
    },
    rows, contacts: [...selectedContacts.values()], companies: [...selectedCompanies.values()],
  };
  return { plan, leads: new Map(leads.map(row => [row.id, row])), companies, contacts };
}

export async function buildCrmBackfillPlan(database: PrismaClient, options: CrmBackfillOptions = {}): Promise<CrmBackfillPlan> {
  return database.$transaction(async transaction => (await prepare(transaction, options)).plan, {
    isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
  });
}

function assertApplyAllowed(apply?: boolean) {
  if (apply !== true) throw new Error("Explicit apply: true (CLI --apply) is required.");
  if (process.env.VERCEL_ENV === "production") {
    if (!shouldRunProductionMigrations(process.env)) throw new Error("Production apply requires both production authorization variables.");
    return;
  }
  const url = process.env.DATABASE_URL;
  let databaseName = "";
  try { databaseName = decodeURIComponent(new URL(url ?? "").pathname).slice(1); } catch { /* Reject below without exposing a URL. */ }
  if (!url || url !== process.env.TEST_DATABASE_URL || !databaseName.endsWith("_test")) {
    throw new Error("Non-production apply requires the guarded test database (matching DATABASE_URL and TEST_DATABASE_URL, name ending _test).");
  }
}

async function audit(transaction: Prisma.TransactionClient, entityType: string, entityId: string, after: Prisma.InputJsonObject) {
  await transaction.auditLog.create({ data: { action: "crm.backfill", entityType, entityId, after } });
}

export async function applyCrmBackfillPlan(
  database: PrismaClient,
  plan: CrmBackfillPlan,
  options: { apply?: boolean } = {},
): Promise<CrmBackfillResult> {
  assertApplyAllowed(options.apply);
  if (process.env.VERCEL_ENV !== "production") {
    const [connected] = await database.$queryRaw<{ name: string }[]>`SELECT current_database() AS name`;
    const expected = decodeURIComponent(new URL(process.env.DATABASE_URL!).pathname).slice(1);
    if (connected?.name !== expected || !connected.name.endsWith("_test")) throw new Error("Connected database does not match the guarded test database.");
  }
  checkOptions({ batchLimit: plan.batchLimit, cursor: plan.cursor ?? undefined });
  if (plan.rows.length > plan.batchLimit || new Set(plan.rows.map(row => row.leadId)).size !== plan.rows.length) throw new Error("Invalid backfill plan.");
  const result = { updatedLeads: 0, nextCursor: plan.cursor, hasMore: plan.hasMore, transactions: 0 };
  // One bounded transaction commits at most 25 Leads plus their entities/history/audit.
  // An error rolls back the current chunk. Rebuild/replay from the original cursor safely.
  for (let offset = 0; offset < plan.rows.length; offset += 25) {
    const chunk = plan.rows.slice(offset, offset + 25);
    const updated = await database.$transaction(async transaction => {
      const fresh = await prepare(transaction, { batchLimit: plan.batchLimit, cursor: plan.cursor ?? undefined });
      const freshRows = new Map(fresh.plan.rows.map(row => [row.leadId, row]));
      // Validate the whole chunk before its first write. Caller-edited plans cannot add links.
      for (const row of chunk) {
        if (JSON.stringify(freshRows.get(row.leadId)) !== JSON.stringify(row)) throw new Error("Backfill plan is stale or changed; rebuild the dry-run plan.");
      }
      let changed = 0;
      for (const row of chunk) {
        const source = fresh.leads.get(row.leadId)!;
        const data = {
          ...(!source.contactId && row.contactId ? { contactId: row.contactId } : {}),
          ...(!source.companyId && row.companyId ? { companyId: row.companyId } : {}),
          ...(!source.stageId && row.stageId ? { stageId: row.stageId } : {}),
        };
        if (Object.keys(data).length === 0) continue;
        if (data.companyId) {
          const candidate = fresh.plan.companies.find(group => group.id === data.companyId)!;
          const first = fresh.leads.get(candidate.sourceLeadIds[0])!;
          const existed = await transaction.company.findUnique({ where: { id: candidate.id }, select: { id: true } });
          await transaction.company.upsert({
            where: { id: candidate.id }, update: {},
            create: { id: candidate.id, companyCode: `CO-${candidate.id}`, name: first.company!.trim(), normalizedName: companyKey(first), countryCode: /^[A-Z]{2}$/.test(countryKey(first.country)) ? countryKey(first.country) : null },
          });
          if (!existed) await audit(transaction, "Company", candidate.id, { sourceLeadIds: candidate.sourceLeadIds });
        }
        if (data.contactId) {
          const candidate = fresh.plan.contacts.find(group => group.id === data.contactId)!;
          const first = fresh.leads.get(candidate.sourceLeadIds[0])!;
          const existed = await transaction.contact.findUnique({ where: { id: candidate.id }, select: { id: true } });
          const phone = normalizePhoneCandidate(first.phone ?? "");
          const whatsapp = normalizePhoneCandidate(first.whatsapp ?? "");
          await transaction.contact.upsert({
            where: { id: candidate.id }, update: {},
            create: {
              id: candidate.id, customerCode: `CU-${candidate.id}`, fullName: first.name!.trim(),
              email: emailKey(first), normalizedEmail: emailKey(first), companyId: row.companyId,
              phone: first.phone, phoneE164: phone.startsWith("+") ? phone : null,
              whatsapp: first.whatsapp, whatsappE164: whatsapp.startsWith("+") ? whatsapp : null,
            },
          });
          if (!existed) await audit(transaction, "Contact", candidate.id, { sourceLeadIds: candidate.sourceLeadIds });
        }
        const saved = await transaction.lead.updateMany({
          where: { id: source.id, version: source.version, contactId: source.contactId, companyId: source.companyId, stageId: source.stageId },
          data: { ...data, version: { increment: 1 } },
        });
        if (saved.count !== 1) throw new Error("Lead changed during backfill; rebuild the dry-run plan.");
        if (data.stageId) await transaction.leadStageHistory.create({ data: {
          leadId: source.id, previousStageId: null, newStageId: data.stageId,
          previousStatus: source.status, newStatus: source.status, source: "BACKFILL",
          ...(source.status === "LOST" ? { reasonCode: "LEGACY_BACKFILL_NO_REASON" } : {}),
        } });
        await audit(transaction, "Lead", source.id, { ...data, sourceLeadId: source.id, version: source.version + 1 });
        changed++;
      }
      return changed;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30_000 });
    result.updatedLeads += updated;
    result.transactions++;
    result.nextCursor = chunk.at(-1)!.leadId;
  }
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const options: CrmBackfillOptions = {};
  let apply = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--apply") apply = true;
    else if (args[i] === "--batch-limit" && args[i + 1]) options.batchLimit = Number(args[++i]);
    else if (args[i] === "--cursor" && args[i + 1]) options.cursor = args[++i];
    else throw new Error("Unknown or incomplete argument. Use --apply, --batch-limit 1..500, --cursor LEAD_ID.");
  }
  checkOptions(options);
  if (apply) assertApplyAllowed(true);
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");
  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const plan = await buildCrmBackfillPlan(database, options);
    const result = apply ? await applyCrmBackfillPlan(database, plan, { apply: true }) : undefined;
    console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", plan, ...(result ? { result } : {}) }, null, 2));
  } finally { await database.$disconnect(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    // Prisma errors can embed source data or connection details. Never print raw errors.
    console.error("CRM backfill stopped. Check arguments, database access, authorization and a fresh dry-run plan. A failed chunk is rolled back; earlier chunks can be safely replayed.");
    process.exitCode = 1;
  });
}
