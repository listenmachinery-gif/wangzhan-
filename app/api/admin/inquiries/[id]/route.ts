import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { crmErrorResponse, crmPrincipal, inquiryDto } from "@/lib/http/crm-response";
import { LeadService } from "@/lib/services/lead-service";
import { leadAssignmentSchema, leadStageUpdateSchema, leadUpdateSchema } from "@/lib/validation/inquiries";
const assignment = leadAssignmentSchema.extend({ action: z.literal("assign") });
type Context = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: Context) {
  try {
    const principal = await crmPrincipal();
    const { id } = await context.params;
    return NextResponse.json(inquiryDto(await new LeadService().get(principal, id)));
  } catch (error) { return crmErrorResponse(error); }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    assertSameOriginMutation(request);
    const { id } = await context.params;
    const body = await request.json();
    const principal = await crmPrincipal();
    const service = new LeadService();
    let result;
    if (body?.action === "assign") {
      const input = assignment.parse(body);
      result = await service.assign(principal, id, { version: input.version, assigneeId: input.assigneeId });
    } else if (body && Object.hasOwn(body, "stageCode")) {
      result = await service.updateStage(principal, id, leadStageUpdateSchema.parse(body));
    } else {
      result = await service.update(principal, id, leadUpdateSchema.parse(body));
    }
    return NextResponse.json(inquiryDto(result));
  } catch (error) { return crmErrorResponse(error); }
}
