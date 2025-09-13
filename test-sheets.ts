import { config } from "dotenv";
config({ path: ".env.local" });

import { google } from "googleapis";

async function test() {
  try {
    console.log("EMAIL:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log("KEY starts with:", (process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "").slice(0, 30));
    console.log("SHEET ID:", process.env.GOOGLE_SHEET_ID);

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: (process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    console.log("✅ Acceso a Sheets correcto:", res.data.spreadsheetUrl);
  } catch (err) {
    console.error("❌ Error accediendo a Google Sheets:", err);
  }
}

test();
