import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ principal: vi.fn(), list: vi.fn(), get: vi.fn(), createManual: vi.fn(), assign: vi.fn(), update: vi.fn(), updateStage: vi.fn(), listStages: vi.fn(), customerList: vi.fn(), customerGet: vi.fn(), customerCreate: vi.fn(), customerUpdate: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getCurrentPrincipal: mocks.principal }));
vi.mock("@/lib/services/lead-service", async (original) => ({ ...await original<typeof import("@/lib/services/lead-service")>(), LeadService: class { list = mocks.list; get = mocks.get; createManual = mocks.createManual; assign = mocks.assign; update = mocks.update; updateStage = mocks.updateStage; listStages = mocks.listStages; } }));
vi.mock("@/lib/services/customer-service", async (original) => ({ ...await original<typeof import("@/lib/services/customer-service")>(), CustomerService: class { list = mocks.customerList; get = mocks.customerGet; create = mocks.customerCreate; update = mocks.customerUpdate; } }));
import * as inquiries from "@/app/api/admin/inquiries/route";
import * as inquiry from "@/app/api/admin/inquiries/[id]/route";
import * as leads from "@/app/api/admin/leads/route";
import * as lead from "@/app/api/admin/leads/[id]/route";
import * as customers from "@/app/api/admin/customers/route";
import * as customer from "@/app/api/admin/customers/[id]/route";
import { GET as stages } from "@/app/api/admin/crm/stages/route";
import { LeadConflictError, LeadNotFoundError, LeadPermissionError, LeadValidationError } from "@/lib/services/lead-service";
import { CustomerConflictError, CustomerDuplicateConfirmationError, CustomerNotFoundError, CustomerPermissionError } from "@/lib/services/customer-service";
const principal = { id: "admin", name: "Admin", email: "admin@example.com", roles: ["ADMIN"] };
const context = { params: Promise.resolve({ id: "lead-1" }) };
const payload = { name: "Buyer", email: "buyer@example.com", message: "Requirement" };
const sensitive = { attributionSnapshot: { secret: true }, passwordHash: "secret", storagePath: "secret", internalNotes: "secret" };
const row = { id: "lead-1", version: 1, status: "NEW", name: "Buyer", email: payload.email, assignments: [{ id: "assignment-1", endedAt: null, assignee: { id: "sales", name: "Sales", email: "sales@example.com", ...sensitive }, ...sensitive }], activities: [{ id: "note-1", type: "NOTE", content: "Scoped activity", actor: { name: "Sales", ...sensitive }, ...sensitive }], ...sensitive };
function request(method = "GET", body?: unknown, origin = "http://localhost") {
  return new NextRequest("http://localhost/api/admin/inquiries", { method, headers: { origin, "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.principal.mockResolvedValue(principal);
  mocks.list.mockResolvedValue({ items: [row], total: 1, page: 1, pageSize: 20 });
  mocks.get.mockResolvedValue(row);
  mocks.createManual.mockResolvedValue({ inquiry: row, duplicateCandidates: { contacts: [], companies: [] } });
  mocks.update.mockResolvedValue(row); mocks.assign.mockResolvedValue(row); mocks.updateStage.mockResolvedValue(row);
  mocks.customerList.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });
  mocks.customerGet.mockResolvedValue({ id: "customer-1", canEdit: false });
  mocks.customerCreate.mockResolvedValue({ customer: { id: "customer-1", canEdit: false }, duplicateCandidates: { contacts: [], companies: [] } });
  mocks.customerUpdate.mockResolvedValue({ id: "customer-1", canEdit: false });
  mocks.listStages.mockResolvedValue([]);
});
describe("CRM routes", () => {
  it("returns 401 for every unauthenticated route", async () => {
    mocks.principal.mockResolvedValue(null);
    for (const call of [() => inquiries.GET(request()), () => inquiries.POST(request("POST", payload)), () => inquiry.GET(request(), context), () => inquiry.PATCH(request("PATCH", { version: 1, status: "NEW" }), context), () => customers.GET(request()), () => customers.POST(request("POST", {})), () => customer.GET(request(), context), () => customer.PATCH(request("PATCH", {}), context), () => stages(request())]) expect((await call()).status).toBe(401);
  });
  it("enforces same origin for all writes before calling services", async () => {
    for (const call of [() => inquiries.POST(request("POST", payload, "https://evil.test")), () => inquiry.PATCH(request("PATCH", { version: 1, status: "NEW" }, "https://evil.test"), context), () => customers.POST(request("POST", {}, "https://evil.test")), () => customer.PATCH(request("PATCH", {}, "https://evil.test"), context)]) expect((await call()).status).toBe(403);
    expect(mocks.createManual).not.toHaveBeenCalled(); expect(mocks.update).not.toHaveBeenCalled(); expect(mocks.customerCreate).not.toHaveBeenCalled(); expect(mocks.customerUpdate).not.toHaveBeenCalled();
  });
  it("rejects malformed/unknown fields and requires email with 400", async () => {
    for (const body of [{ name: "Buyer", message: "Requirement" }, { ...payload, unsafe: true }]) expect((await inquiries.POST(request("POST", body))).status).toBe(400);
    expect((await inquiry.PATCH(request("PATCH", { action: "assign", version: 1, assigneeId: "sales", unsafe: true }), context)).status).toBe(400);
    expect((await inquiries.POST(new NextRequest("http://localhost/api/admin/inquiries", { method: "POST", headers: { origin: "http://localhost" }, body: "{" }))).status).toBe(400);
    expect(mocks.createManual).not.toHaveBeenCalled(); expect(mocks.assign).not.toHaveBeenCalled();
  });
  it.each([[new LeadPermissionError(), 403], [new LeadNotFoundError(), 404], [new LeadConflictError(), 409], [new LeadValidationError("Invalid"), 400]])("maps lead service errors %s to %i", async (error, status) => {
    mocks.update.mockRejectedValueOnce(error);
    expect((await inquiry.PATCH(request("PATCH", { version: 1, status: "NEW" }), context)).status).toBe(status);
  });
  it.each([[new CustomerPermissionError(), 403], [new CustomerNotFoundError(), 404], [new CustomerConflictError(), 409]])("maps customer service errors %s to %i", async (error, status) => {
    mocks.customerUpdate.mockRejectedValueOnce(error);
    expect((await customer.PATCH(request("PATCH", { version: 1, fullName: "Buyer" }), context)).status).toBe(status);
  });
  it("supports explicit initial assignment and maps manager assignment validation", async () => {
    mocks.principal.mockResolvedValue({ ...principal, roles: ["SALES_MANAGER"] });
    mocks.createManual.mockRejectedValueOnce(new LeadValidationError("Choose an initial assignee."));
    expect((await inquiries.POST(request("POST", payload))).status).toBe(400);
    mocks.createManual.mockRejectedValueOnce(new LeadPermissionError());
    expect((await inquiries.POST(request("POST", { ...payload, assigneeId: "outside" }))).status).toBe(403);
    expect((await inquiries.POST(request("POST", { ...payload, assigneeId: "sales" }))).status).toBe(201);
    expect(mocks.createManual).toHaveBeenLastCalledWith(expect.objectContaining({ roles: ["SALES_MANAGER"] }), expect.objectContaining({ assigneeId: "sales" }));
  });
  it("returns scoped duplicate candidates with 409 until explicit confirmation", async () => {
    const candidates = { contacts: [{ id: "c1", customerCode: "CU-1", fullName: "Buyer" }], companies: [] };
    mocks.createManual.mockRejectedValueOnce(new CustomerDuplicateConfirmationError(candidates));
    const first = await inquiries.POST(request("POST", { ...payload, contact: { fullName: "Buyer", email: payload.email } }));
    expect(first.status).toBe(409); expect(await first.json()).toMatchObject({ code: "DUPLICATE_CONFIRMATION_REQUIRED", duplicateCandidates: candidates });
    expect((await inquiries.POST(request("POST", { ...payload, confirmDuplicateCreation: true }))).status).toBe(201);
  });
  it("keeps old/new aliases on identical service methods and safe compatible DTOs", async () => {
    for (const route of [inquiries, leads]) {
      const list = await (await route.GET(request())).json();
      expect(list).toMatchObject({ total: 1, page: 1, pageSize: 20, items: [{ id: "lead-1", assignments: [{ assignee: { name: "Sales" } }] }] });
      expect(JSON.stringify(list)).not.toContain("secret");
      const created = await route.POST(request("POST", payload)); expect(created.status).toBe(201); expect(JSON.stringify(await created.json())).not.toContain("secret");
    }
    for (const route of [inquiry, lead]) {
      const detail = await (await route.GET(request(), context)).json();
      expect(detail.activities[0].content).toBe("Scoped activity"); expect(JSON.stringify(detail)).not.toContain("secret");
      expect((await route.PATCH(request("PATCH", { version: 1, stageCode: "TO_CONTACT" }), context)).status).toBe(200);
      expect((await route.PATCH(request("PATCH", { action: "assign", version: 1, assigneeId: "sales" }), context)).status).toBe(200);
    }
    expect(mocks.list).toHaveBeenCalledTimes(2); expect(mocks.createManual).toHaveBeenCalledTimes(2); expect(mocks.get).toHaveBeenCalledTimes(2); expect(mocks.updateStage).toHaveBeenCalledTimes(2); expect(mocks.assign).toHaveBeenCalledTimes(2);
  });
  it("serves customer and stage endpoints and rejects unknown queries", async () => {
    expect((await customers.GET(request())).status).toBe(200);
    expect((await customer.GET(request(), context)).status).toBe(200);
    expect((await customers.POST(request("POST", { fullName: "Buyer", email: payload.email }))).status).toBe(201);
    expect((await stages(request())).status).toBe(200);
    expect((await inquiries.GET(new NextRequest("http://localhost/api/admin/inquiries?unknown=yes"))).status).toBe(400);
    expect((await customers.GET(new NextRequest("http://localhost/api/admin/customers?unknown=yes"))).status).toBe(400);
  });
});
