import { inspect } from "node:util";
import { describe, expect, it, vi } from "vitest";
import { crmErrorResponse } from "@/lib/http/crm-response";
import { leadErrorResponse } from "@/lib/http/lead-response";

describe("sanitized CRM unexpected errors", () => {
  it.each([
    { label: "CRM", mapper: crmErrorResponse },
    { label: "legacy Lead", mapper: leadErrorResponse },
  ])("never logs raw errors through the $label mapper", async ({ mapper }) => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("SECRET_CONTACT buyer@example.com NOTE_CONTENT Prisma invocation payload");
    error.name = "SECRET_CUSTOM_ERROR_NAME";
    Object.assign(error, { contact: { email: "SECRET_EMAIL" } });
    const response = mapper(error);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ code: "LEAD_OPERATION_FAILED" });
    expect(log).toHaveBeenCalledOnce();
    expect(inspect(log.mock.calls)).not.toMatch(/SECRET|buyer@example|NOTE_CONTENT|Prisma|payload|stack/);
    expect(log.mock.calls[0]).toEqual([{ code: "LEAD_OPERATION_FAILED" }]);
  });
});
