import { NextRequest, NextResponse } from "next/server";
import { listRegistrations, freeSlotsLeft, Registration } from "@/lib/registrationsStore";

interface ListResponse {
  rows: Registration[];
  freeSlotsLeft: number;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const eventId = (url.searchParams.get("eventId") || "fyf-open-001").trim();

    const rows = listRegistrations(eventId);
    const remaining = freeSlotsLeft(eventId, 15);

    const data: ListResponse = { rows, freeSlotsLeft: remaining };
    return NextResponse.json(data);
  } catch (e: unknown) {
    console.error("❌ registrations error:", e);
    return NextResponse.json({ error: "No se pudieron cargar inscripciones" }, { status: 500 });
  }
}
