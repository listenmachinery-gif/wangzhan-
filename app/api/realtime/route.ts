import { upgradeWebSocket } from "@vercel/functions";

import { RealtimeGateway } from "@/lib/realtime/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  const gateway = new RealtimeGateway();
  return upgradeWebSocket((socket) => gateway.accept(socket), { maxPayload: 16 * 1024 });
}
