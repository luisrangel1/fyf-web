import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: (process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "").replace(/\\n/g, "\n"),
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

export async function appendToSheet(row: {
  createdAtISO: string;
  eventId: string;
  method: string;
  nickname: string;
  wallet: string;
  txId: string;
  amount: string;
  payerEmail: string;
}) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID as string;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Sheet1!A:H",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          row.createdAtISO,
          row.eventId,
          row.method,
          row.nickname,
          row.wallet,
          row.txId,
          row.amount,
          row.payerEmail,
        ],
      ],
    },
  });
}

