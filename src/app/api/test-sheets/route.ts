import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: (process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const sheetId = process.env.GOOGLE_SHEET_ID as string;

    // Solo leemos el título del documento para confirmar acceso
    const res = await sheets.spreadsheets.get({ spreadsheetId: sheetId });

    return NextResponse.json({
      ok: true,
      title: res.data.properties?.title || "Sin título",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error desconocido";

    console.error("❌ Error en test-sheets route:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}


