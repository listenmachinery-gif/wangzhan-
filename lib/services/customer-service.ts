import "server-only";

import { randomUUID } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";

import { can, type Principal } from "@/lib/auth/permissions";
import { normalizeCompanyName, normalizePhoneCandidate } from "@/lib/crm/normalization";
import { db } from "@/lib/db/client";
import { leadWhereForScope, resolveCrmAccessScope } from "@/lib/services/crm-access-service";
import {
  customerCreateSchema,
  customerListQuerySchema,
  customerUpdateSchema,
  type CustomerCreateInput,
  type ManualInquiryInput,
  type CustomerUpdateInput,
} from "@/lib/validation/crm";

export class CustomerPermissionError extends Error {
  constructor() {
    super("Permission denied for this customer operation.");
    this.name = "CustomerPermissionError";
  }
}

export class CustomerNotFoundError extends Error {
  constructor() {
    super("Customer or company was not found.");
    this.name = "CustomerNotFoundError";
  }
}

export class CustomerConflictError extends Error {
  constructor() {
    super("The customer or company has changed. Reload before saving.");
    this.name = "CustomerConflictError";
  }
}

export class CustomerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerValidationError";
  }
}

const contactSelect = {
  id: true,
  customerCode: true,
  companyId: true,
  fullName: true,
  firstName: true,
  lastName: true,
  jobTitle: true,
  department: true,
  email: true,
  phone: true,
  whatsapp: true,
  countryCode: true,
  state: true,
  city: true,
  timezone: true,
  preferredLanguage: true,
  preferredContactMethod: true,
  preferredContactTime: true,
  customerLevel: true,
  customerStatus: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  version: true,
} satisfies Prisma.ContactSelect;

const companySelect = {
  id: true,
  companyCode: true,
  name: true,
  website: true,
  industry: true,
  companySize: true,
  countryCode: true,
  state: true,
  city: true,
  postalCode: true,
  address: true,
  ownerId: true,
  version: true,
} satisfies Prisma.CompanySelect;

const inquirySelect = {
  id: true,
  inquiryNumber: true,
  status: true,
  stage: { select: { code: true, name: true } },
  sourceChannel: true,
  createdAt: true,
  nextFollowUpAt: true,
} satisfies Prisma.LeadSelect;

const timelineSelect = {
  id: true,
  leadId: true,
  type: true,
  content: true,
  createdAt: true,
} satisfies Prisma.LeadActivitySelect;

const contactCandidateSelect = { id: true, customerCode: true, fullName: true } as const;
const companyCandidateSelect = { id: true, companyCode: true, name: true } as const;
const candidateLimit = 10;

type ContactRow = Prisma.ContactGetPayload<{ select: typeof contactSelect }>;
type CompanyRow = Prisma.CompanyGetPayload<{ select: typeof companySelect }>;
type CustomerScope = {
  leadWhere: Prisma.LeadWhereInput;
  editAll: boolean;
  editOwnerIds: string[];
};

export type CustomerDuplicateCandidates = {
  contacts: Prisma.ContactGetPayload<{ select: typeof contactCandidateSelect }>[];
  companies: Prisma.CompanyGetPayload<{ select: typeof companyCandidateSelect }>[];
};

type InquirySummary = {
  inquiryCount: number;
  firstInquiryAt: Date | null;
  lastInquiryAt: Date | null;
};

const emptySummary: InquirySummary = {
  inquiryCount: 0,
  firstInquiryAt: null,
  lastInquiryAt: null,
};

export type CustomerCompany = Omit<CompanyRow, "ownerId" | "version"> & (
  | { canEdit: false }
  | { canEdit: true; ownerId: string | null; version: number }
);

export type CustomerListItem = Omit<ContactRow, "ownerId" | "version" | "customerLevel" | "customerStatus"> & InquirySummary & {
  company: CustomerCompany | null;
} & (
  | { canEdit: false }
  | {
      canEdit: true;
      ownerId: string | null;
      version: number;
      customerLevel: ContactRow["customerLevel"];
      customerStatus: string | null;
      internalNotes: string | null;
    }
);

export type CustomerDetail = CustomerListItem & {
  inquiries: Prisma.LeadGetPayload<{ select: typeof inquirySelect }>[];
  timeline: Prisma.LeadActivityGetPayload<{ select: typeof timelineSelect }>[];
};

type Transaction = Prisma.TransactionClient;

async function resolveCustomerScope(transaction: Transaction, principal: Principal): Promise<CustomerScope> {
  const now = new Date();
  const leadScope = await resolveCrmAccessScope(transaction, principal, now);
  const leadWhere = leadWhereForScope(leadScope);
  if (!can(principal, "customer.update")) {
    return { leadWhere, editAll: false, editOwnerIds: [] };
  }
  if (principal.roles.includes("ADMIN") || principal.roles.includes("SUPER_ADMIN")) {
    return { leadWhere, editAll: true, editOwnerIds: [] };
  }

  const editOwnerIds = new Set([principal.id]);
  if (principal.roles.includes("SALES_MANAGER")) {
    // A viewer membership can expand inquiry reads, while only managed teams can expand edits.
    const managerScope = principal.roles.includes("CRM_VIEWER")
      ? await resolveCrmAccessScope(transaction, { ...principal, roles: ["SALES_MANAGER"] }, now)
      : leadScope;
    if (managerScope.kind === "ASSIGNEES") {
      for (const id of managerScope.assigneeIds) editOwnerIds.add(id);
    }
  }
  return { leadWhere, editAll: false, editOwnerIds: [...editOwnerIds] };
}

function visibleCustomerWhere(scope: CustomerScope): Prisma.ContactWhereInput & Prisma.CompanyWhereInput {
  if (scope.editAll) return {};
  return { OR: [{ ownerId: { in: scope.editOwnerIds } }, { leads: { some: scope.leadWhere } }] };
}

function canEditOwner(scope: CustomerScope, ownerId: string | null) {
  return scope.editAll || (ownerId !== null && scope.editOwnerIds.includes(ownerId));
}

function toCompany(row: CompanyRow, scope: CustomerScope): CustomerCompany {
  const { ownerId, version, ...basics } = row;
  if (!canEditOwner(scope, ownerId)) return { ...basics, canEdit: false };
  return { ...basics, canEdit: true, ownerId, version };
}

async function loadRelatedCompanies(transaction: Transaction, scope: CustomerScope, contacts: ContactRow[]) {
  const ids = contacts.flatMap(({ companyId }) => companyId === null ? [] : [companyId]);
  if (ids.length === 0) return new Map<string, CustomerCompany>();
  const companies = await transaction.company.findMany({
    where: { AND: [{ id: { in: ids } }, visibleCustomerWhere(scope)] },
    select: companySelect,
  });
  return new Map(companies.map((row) => [row.id, toCompany(row, scope)]));
}

async function loadEditableNotes(transaction: Transaction, scope: CustomerScope, rows: ContactRow[]) {
  const ids = rows.filter(({ ownerId }) => canEditOwner(scope, ownerId)).map(({ id }) => id);
  if (ids.length === 0) return new Map<string, string | null>();
  const notes = await transaction.contact.findMany({
    where: { id: { in: ids } },
    select: { id: true, internalNotes: true },
  });
  return new Map(notes.map(({ id, internalNotes }) => [id, internalNotes]));
}

function toCustomer(
  contact: ContactRow,
  company: CustomerCompany | null,
  summary: InquirySummary,
  notes: Map<string, string | null>,
): CustomerListItem {
  const { ownerId, version, customerLevel, customerStatus, ...basics } = contact;
  const entry = { ...basics, ...summary, companyId: company?.id ?? null, company };
  if (!notes.has(contact.id)) return { ...entry, canEdit: false };
  return {
    ...entry, canEdit: true, ownerId, version, customerLevel, customerStatus,
    internalNotes: notes.get(contact.id) ?? null,
  };
}

async function requireVisibleContact(transaction: Transaction, scope: CustomerScope, contactId: string) {
  const row = await transaction.contact.findFirst({
    where: { AND: [{ id: contactId }, visibleCustomerWhere(scope)] },
    select: contactSelect,
  });
  if (!row) throw new CustomerNotFoundError();
  return row;
}

async function readDetail(
  transaction: Transaction,
  scope: CustomerScope,
  contact: ContactRow,
): Promise<CustomerDetail> {
  const inquiryWhere = { AND: [{ contactId: contact.id }, scope.leadWhere] };
  const [companies, notes, inquiries, timeline] = await Promise.all([
    loadRelatedCompanies(transaction, scope, [contact]),
    loadEditableNotes(transaction, scope, [contact]),
    transaction.lead.findMany({
      where: inquiryWhere,
      select: inquirySelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
    transaction.leadActivity.findMany({
      where: { lead: inquiryWhere },
      select: timelineSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
  ]);
  const summary = {
    inquiryCount: inquiries.length,
    firstInquiryAt: inquiries.at(-1)?.createdAt ?? null,
    lastInquiryAt: inquiries[0]?.createdAt ?? null,
  };
  const company = contact.companyId ? companies.get(contact.companyId) ?? null : null;
  return { ...toCustomer(contact, company, summary, notes), inquiries, timeline };
}

function normalizeInternationalPhone(value: string | null | undefined) {
  if (value === undefined || value === null) return value;
  const candidate = normalizePhoneCandidate(value);
  return candidate.startsWith("+") ? candidate : null;
}

async function findCandidates(
  transaction: Transaction,
  scope: CustomerScope,
  input: CustomerCreateInput,
): Promise<CustomerDuplicateCandidates> {
  const phones = [normalizeInternationalPhone(input.phone), normalizeInternationalPhone(input.whatsapp)]
    .filter((phone): phone is string => Boolean(phone));
  const contactMatches: Prisma.ContactWhereInput[] = [];
  if (input.email) contactMatches.push({ normalizedEmail: input.email });
  if (phones.length) contactMatches.push({ phoneE164: { in: phones } }, { whatsappE164: { in: phones } });

  const [contacts, companies] = await Promise.all([
    contactMatches.length ? transaction.contact.findMany({
      where: { AND: [visibleCustomerWhere(scope), { OR: contactMatches }] },
      select: contactCandidateSelect,
      orderBy: { id: "asc" },
      take: candidateLimit,
    }) : [],
    input.company ? transaction.company.findMany({
      where: { AND: [visibleCustomerWhere(scope), { normalizedName: normalizeCompanyName(input.company.name) }] },
      select: companyCandidateSelect,
      orderBy: { id: "asc" },
      take: candidateLimit,
    }) : [],
  ]);
  return { contacts, companies };
}

function contactData<T extends { email?: string | null; phone?: string | null; whatsapp?: string | null }>(input: T) {
  return {
    ...input,
    normalizedEmail: input.email,
    phoneE164: normalizeInternationalPhone(input.phone),
    whatsappE164: normalizeInternationalPhone(input.whatsapp),
  };
}

async function validateOwner(transaction: Transaction, scope: CustomerScope, ownerId: string | null | undefined) {
  if (ownerId === undefined) return;
  if (!canEditOwner(scope, ownerId)) throw new CustomerPermissionError();
  if (ownerId !== null && !await transaction.user.findUnique({ where: { id: ownerId }, select: { id: true } })) {
    throw new CustomerValidationError("The selected owner does not exist.");
  }
}

async function requireVisibleCompany(transaction: Transaction, scope: CustomerScope, companyId: string) {
  const company = await transaction.company.findFirst({
    where: { AND: [{ id: companyId }, visibleCustomerWhere(scope)] },
    select: { ownerId: true },
  });
  if (!company) throw new CustomerNotFoundError();
  return company;
}

function writeAudit(
  transaction: Transaction,
  actorId: string,
  entityType: "Contact" | "Company",
  entityId: string,
  inputs: Record<string, unknown>,
  previousVersion?: number,
) {
  const changedFields = Object.keys(inputs).filter((key) => inputs[key] !== undefined).sort();
  const action = entityType === "Contact" ? "customer" : "company";
  return transaction.auditLog.create({
    data: {
      actorId,
      action: `${action}.${previousVersion === undefined ? "create" : "update"}`,
      entityType,
      entityId,
      before: previousVersion === undefined ? undefined : { version: previousVersion },
      after: { version: (previousVersion ?? 0) + 1, changedFields },
    },
    select: { id: true },
  });
}

async function createCompany(
  transaction: Transaction,
  scope: CustomerScope,
  actorId: string,
  company: NonNullable<CustomerCreateInput["company"]>,
) {
  await validateOwner(transaction, scope, company.ownerId);
  const data = { ...company, ownerId: company.ownerId === undefined ? actorId : company.ownerId };
  const row = await transaction.company.create({
    data: {
      ...data,
      companyCode: `CO-${randomUUID().toUpperCase()}`,
      normalizedName: normalizeCompanyName(data.name),
      createdById: actorId,
      updatedById: actorId,
    },
    select: { id: true },
  });
  await writeAudit(transaction, actorId, "Company", row.id, data);
  return row.id;
}

async function updateCompany(
  transaction: Transaction,
  scope: CustomerScope,
  actorId: string,
  companyId: string | null,
  { version, ...fields }: NonNullable<CustomerUpdateInput["company"]>,
) {
  if (!companyId) throw new CustomerNotFoundError();
  const company = await requireVisibleCompany(transaction, scope, companyId);
  if (!canEditOwner(scope, company.ownerId)) throw new CustomerPermissionError();
  await validateOwner(transaction, scope, fields.ownerId);
  const updated = await transaction.company.updateMany({
    where: { id: companyId, version },
    data: {
      ...fields,
      normalizedName: fields.name === undefined ? undefined : normalizeCompanyName(fields.name),
      updatedById: actorId,
      version: { increment: 1 },
    },
  });
  if (updated.count !== 1) throw new CustomerConflictError();
  await writeAudit(transaction, actorId, "Company", companyId, fields, version);
}

async function runCustomerWrite<T>(database: PrismaClient, work: (transaction: Transaction) => Promise<T>) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await database.$transaction(work, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      const retryable = (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034")
        || (error instanceof Error && error.message.includes("TransactionWriteConflict"));
      if (!retryable) throw error;
      if (attempt === 3) throw new CustomerConflictError();
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 5));
    }
  }
}

export class CustomerDuplicateConfirmationError extends Error {
  constructor(public readonly duplicateCandidates: CustomerDuplicateCandidates) {
    super("Confirm creation of a distinct customer or company matching existing records.");
    this.name = "CustomerDuplicateConfirmationError";
  }
}

/** Runs inside the caller's transaction so customer links, creation and inquiry remain atomic. */
export async function prepareInquiryCustomerLinks(transaction: Transaction, principal: Principal, input: ManualInquiryInput) {
  if (!can(principal, "inquiry.create")) throw new CustomerPermissionError();
  const scope = await resolveCustomerScope(transaction, principal);
  const contact = input.contactId ? await requireVisibleContact(transaction, scope, input.contactId) : null;
  let companyId = input.companyId;
  if (companyId) await requireVisibleCompany(transaction, scope, companyId);
  if (!companyId && !input.company && contact?.companyId) {
    try {
      await requireVisibleCompany(transaction, scope, contact.companyId);
      companyId = contact.companyId;
    } catch (error) {
      if (!(error instanceof CustomerNotFoundError)) throw error;
    }
  }
  const duplicateCandidates = await findCandidates(transaction, scope, {
    fullName: input.name, email: input.email, ...input.contact, company: input.company,
  });
  if (!input.confirmDuplicateCreation && (
    (input.contact && duplicateCandidates.contacts.length > 0) ||
    (input.company && duplicateCandidates.companies.length > 0)
  )) throw new CustomerDuplicateConfirmationError(duplicateCandidates);

  if (input.company) companyId = await createCompany(transaction, scope, principal.id, input.company);
  let contactId = contact?.id;
  if (input.contact) {
    if (!can(principal, "customer.create")) throw new CustomerPermissionError();
    await validateOwner(transaction, scope, input.contact.ownerId);
    const data = { ...input.contact, companyId, ownerId: input.contact.ownerId === undefined ? principal.id : input.contact.ownerId };
    const row = await transaction.contact.create({
      data: { ...contactData(data), customerCode: `CU-${randomUUID().toUpperCase()}`, createdById: principal.id, updatedById: principal.id },
      select: { id: true },
    });
    contactId = row.id;
    await writeAudit(transaction, principal.id, "Contact", row.id, data);
  }
  return { contactId, companyId, duplicateCandidates };
}

export class CustomerService {
  constructor(private readonly database: PrismaClient = db) {}

  async list(principal: Principal, rawQuery: unknown) {
    if (!can(principal, "customer.read")) throw new CustomerPermissionError();
    const { page, pageSize, query, countryCode, customerLevel, ownerId } = customerListQuerySchema.parse(rawQuery);

    return this.database.$transaction(async (transaction) => {
      const scope = await resolveCustomerScope(transaction, principal);
      const where: Prisma.ContactWhereInput = {
        AND: [
          visibleCustomerWhere(scope),
          {
            countryCode: countryCode ?? undefined,
            customerLevel,
            ownerId: ownerId ?? undefined,
          },
          (customerLevel || ownerId) && !scope.editAll ? { ownerId: { in: scope.editOwnerIds } } : {},
          query ? {
            OR: [
              { fullName: { contains: query, mode: "insensitive" } },
              { customerCode: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { phone: { contains: query } },
              { whatsapp: { contains: query } },
              {
                company: { AND: [visibleCustomerWhere(scope), { normalizedName: { contains: normalizeCompanyName(query) } }] },
              },
            ],
          } : {},
        ],
      };
      const [rows, total] = await Promise.all([
        transaction.contact.findMany({
          where,
          select: contactSelect,
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        transaction.contact.count({ where }),
      ]);
      const [companies, notes, grouped] = await Promise.all([
        loadRelatedCompanies(transaction, scope, rows),
        loadEditableNotes(transaction, scope, rows),
        transaction.lead.groupBy({
          by: ["contactId"],
          where: { AND: [{ contactId: { in: rows.map(({ id }) => id) } }, scope.leadWhere] },
          _count: { _all: true },
          _min: { createdAt: true },
          _max: { createdAt: true },
        }),
      ]);
      const summaries = new Map(grouped.map((group) => [
        group.contactId, {
          inquiryCount: group._count._all,
          firstInquiryAt: group._min.createdAt,
          lastInquiryAt: group._max.createdAt,
        },
      ]));
      const items = rows.map((contact) => toCustomer(
        contact,
        contact.companyId ? companies.get(contact.companyId) ?? null : null,
        summaries.get(contact.id) ?? emptySummary,
        notes,
      ));
      return { items, total, page, pageSize };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }

  async get(principal: Principal, contactId: string): Promise<CustomerDetail> {
    if (!can(principal, "customer.read")) throw new CustomerPermissionError();
    return this.database.$transaction(async (transaction) => {
      const scope = await resolveCustomerScope(transaction, principal);
      return readDetail(transaction, scope, await requireVisibleContact(transaction, scope, contactId));
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }

  async findDuplicateCandidates(principal: Principal, rawInput: unknown): Promise<CustomerDuplicateCandidates> {
    if (!can(principal, "customer.create")) throw new CustomerPermissionError();
    const input = customerCreateSchema.parse(rawInput);
    return this.database.$transaction(async (transaction) => {
      const scope = await resolveCustomerScope(transaction, principal);
      return findCandidates(transaction, scope, input);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }

  async create(principal: Principal, rawInput: unknown) {
    if (!can(principal, "customer.create")) throw new CustomerPermissionError();
    const input = customerCreateSchema.parse(rawInput);
    const { company, ...fields } = input;
    return runCustomerWrite(this.database, async (transaction) => {
      const scope = await resolveCustomerScope(transaction, principal);
      await validateOwner(transaction, scope, fields.ownerId);
      if (fields.companyId) await requireVisibleCompany(transaction, scope, fields.companyId);

      const duplicateCandidates = await findCandidates(transaction, scope, input);
      const companyId = company ? await createCompany(transaction, scope, principal.id, company) : fields.companyId;
      const data = { ...fields, companyId, ownerId: fields.ownerId === undefined ? principal.id : fields.ownerId };
      const contact = await transaction.contact.create({
        data: {
          ...contactData(data),
          customerCode: `CU-${randomUUID().toUpperCase()}`,
          createdById: principal.id,
          updatedById: principal.id,
        },
        select: contactSelect,
      });
      await writeAudit(transaction, principal.id, "Contact", contact.id, data);
      return { customer: await readDetail(transaction, scope, contact), duplicateCandidates };
    });
  }

  async update(principal: Principal, contactId: string, rawInput: unknown): Promise<CustomerDetail> {
    if (!can(principal, "customer.update")) throw new CustomerPermissionError();
    const { version, company, ...fields } = customerUpdateSchema.parse(rawInput);
    return runCustomerWrite(this.database, async (transaction) => {
      const scope = await resolveCustomerScope(transaction, principal);
      const contact = await requireVisibleContact(transaction, scope, contactId);
      if (!canEditOwner(scope, contact.ownerId)) throw new CustomerPermissionError();
      if (contact.version !== version) throw new CustomerConflictError();

      const contactMethods = [fields.email, fields.phone, fields.whatsapp];
      if (contactMethods.some((method) => method !== undefined) && ![
        fields.email === undefined ? contact.email : fields.email,
        fields.phone === undefined ? contact.phone : fields.phone,
        fields.whatsapp === undefined ? contact.whatsapp : fields.whatsapp,
      ].some((method) => method?.trim())) {
        throw new CustomerValidationError("Provide an email, phone or WhatsApp number.");
      }

      await validateOwner(transaction, scope, fields.ownerId);
      if (fields.companyId) await requireVisibleCompany(transaction, scope, fields.companyId);
      if (company) await updateCompany(transaction, scope, principal.id, contact.companyId, company);
      const [updated] = await transaction.contact.updateManyAndReturn({
        where: { id: contactId, version },
        data: { ...contactData(fields), updatedById: principal.id, version: { increment: 1 } },
        select: contactSelect,
      });
      if (!updated) throw new CustomerConflictError();
      await writeAudit(transaction, principal.id, "Contact", contactId, fields, version);
      return readDetail(transaction, scope, updated);
    });
  }
}
