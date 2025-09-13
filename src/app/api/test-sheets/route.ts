import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      (process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "").replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    const sheetId = process.env.GOOGLE_SHEET_ID as string;

    // Solo leemos el título del documento para confirmar acceso
    const res = await sheets.spreadsheets.get({ spreadsheetId: sheetId });

    return NextResponse.json({
      ok: true,
      title: res.data.properties?.title || "Sin título",
    });
  } catch (err: any) {
    console.error("❌ Error en test-sheets route:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
