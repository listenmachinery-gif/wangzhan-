import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { PATCH as updateLead } from "@/app/api/admin/leads/[id]/route";
import { POST as submitInquiry } from "@/app/api/inquiry/route";

describe("inquiry and CRM route errors", () => {
  it("returns the generic accepted response for a honeypot-only submission", async () => {
    const response = await submitInquiry(new Request("http://localhost/api/inquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ website: "https://bot.example" }),
    }));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toMatchObject({
      message: "Thank you. Your inquiry has been received. Our team will reply soon.",
      reference: expect.stringMatching(/^inq_[a-f0-9]{24}$/),
    });
  });

  it("maps malformed CRM mutation JSON to a client error", async () => {
    const request = new NextRequest("http://localhost/api/admin/leads/lead-1", {
      method: "PATCH",
      headers: {
        host: "localhost",
        origin: "http://localhost",
        "sec-fetch-site": "same-origin",
        "content-type": "application/json",
      },
      body: '{"status":',
    });
    const response = await updateLead(request, { params: Promise.resolve({ id: "lead-1" }) });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: "INVALID_LEAD" });
  });
});
