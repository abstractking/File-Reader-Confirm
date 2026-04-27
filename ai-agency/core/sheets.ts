// core/sheets.ts
// ═════════════════════════════════════════════
//  Google Sheets integration
//  Appends a row for every lead SCOUT saves.
//  No approval required — writes immediately.
//
//  Required secrets:
//    GOOGLE_SERVICE_ACCOUNT_JSON — full JSON of the service account key file
//    GOOGLE_SHEET_ID             — the spreadsheet ID from the sheet URL
// ═════════════════════════════════════════════

import { google } from "googleapis";
import { Lead }   from "./types";

const SHEET_TAB   = "Sheet1";
const HEADERS     = [
  "ID",
  "Created At",
  "Source",
  "Business Name",
  "Contact Name",
  "Email",
  "Phone",
  "Website URL",
  "Niche",
  "Location",
  "Notes",
  "Score",
  "Status",
];

// ─────────────────────────────────────────────
// Build an authenticated Sheets client
// ─────────────────────────────────────────────
function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON secret is not set");

  const credentials = JSON.parse(raw);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

// ─────────────────────────────────────────────
// ensureHeaders
// Checks row 1 of the sheet. If it is empty,
// writes the 13-column header row.
// Safe to call on every startup.
// ─────────────────────────────────────────────
export async function ensureHeaders(): Promise<void> {
  const rawId = process.env.GOOGLE_SHEET_ID?.trim();
  if (!rawId) {
    console.warn("[Sheets] GOOGLE_SHEET_ID not set — skipping header check");
    return;
  }

  // If the user pasted the full URL, extract the ID from it automatically
  // e.g. https://docs.google.com/spreadsheets/d/SHEET_ID/edit
  const urlMatch = rawId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const sheetId  = urlMatch ? urlMatch[1] : rawId;

  console.log(`[Sheets] Using sheet ID: ${sheetId.slice(0, 8)}... (len=${sheetId.length})`);

  try {
    const sheets = getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range:         `${SHEET_TAB}!A1:M1`,
    });

    const row1 = res.data.values?.[0];
    if (row1 && row1.length > 0) {
      console.log("[Sheets] Headers already present — skipping write");
      return;
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range:         `${SHEET_TAB}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });

    console.log("[Sheets] ✅ Headers written to row 1");
  } catch (err: any) {
    console.error("[Sheets] ensureHeaders error:", err.message);
  }
}

// ─────────────────────────────────────────────
// appendLeadRow
// Appends one row to the sheet immediately
// when SCOUT saves a lead to the DB.
// Errors are caught and logged — never throws
// so SCOUT's main flow is never disrupted.
// ─────────────────────────────────────────────
export async function appendLeadRow(lead: Lead): Promise<void> {
  const rawId = process.env.GOOGLE_SHEET_ID?.trim();
  if (!rawId) {
    console.warn("[Sheets] GOOGLE_SHEET_ID not set — skipping lead append");
    return;
  }

  const urlMatch = rawId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const sheetId  = urlMatch ? urlMatch[1] : rawId;

  try {
    const sheets = getSheetsClient();

    const row = [
      lead.id,
      lead.created_at instanceof Date
        ? lead.created_at.toISOString()
        : String(lead.created_at),
      lead.source        ?? "",
      lead.business_name ?? "",
      lead.contact_name  ?? "",
      lead.email         ?? "",
      lead.phone         ?? "",
      lead.website_url   ?? "",
      lead.niche         ?? "",
      lead.location      ?? "",
      lead.notes         ?? "",
      lead.score         ?? 0,
      lead.status        ?? "new",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range:         `${SHEET_TAB}!A:M`,
      valueInputOption:        "RAW",
      insertDataOption:        "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    console.log(`[Sheets] ✅ Appended lead: ${lead.business_name}`);
  } catch (err: any) {
    console.error("[Sheets] appendLeadRow error:", err.message);
  }
}
