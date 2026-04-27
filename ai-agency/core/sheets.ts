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

const SHEET_TAB = "Sheet1";
const HEADERS   = [
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

// Pixel widths for each column — wide enough so nothing is cut off
const COLUMN_WIDTHS = [
  280,  // A — ID (UUID)
  185,  // B — Created At
  110,  // C — Source
  200,  // D — Business Name
  150,  // E — Contact Name
  200,  // F — Email
  130,  // G — Phone
  220,  // H — Website URL
  120,  // I — Niche
  180,  // J — Location
  350,  // K — Notes
   70,  // L — Score
   90,  // M — Status
];

// ─────────────────────────────────────────────
// Helpers
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

/** Extract bare spreadsheet ID whether given a full URL or just the ID. */
function parseSheetId(raw: string): string {
  const match = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : raw;
}

/**
 * Look up the numeric sheetId (gid) for SHEET_TAB.
 * Returns 0 (first sheet default) if lookup fails.
 */
async function getNumericSheetId(
  sheets: ReturnType<typeof getSheetsClient>,
  spreadsheetId: string
): Promise<number> {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties" });
    const sheet = meta.data.sheets?.find(
      s => s.properties?.title === SHEET_TAB
    );
    return sheet?.properties?.sheetId ?? 0;
  } catch {
    return 0;
  }
}

// ─────────────────────────────────────────────
// ensureHeaders
// Checks row 1. If empty, writes the 13-column
// header row. Then sets column widths so all
// text is fully visible (runs on every startup).
// ─────────────────────────────────────────────
export async function ensureHeaders(): Promise<void> {
  const rawId = process.env.GOOGLE_SHEET_ID?.trim();
  if (!rawId) {
    console.warn("[Sheets] GOOGLE_SHEET_ID not set — skipping header check");
    return;
  }

  const spreadsheetId = parseSheetId(rawId);
  console.log(`[Sheets] Using sheet ID: ${spreadsheetId.slice(0, 8)}... (len=${spreadsheetId.length})`);

  try {
    const sheets = getSheetsClient();

    // ── 1. Write headers if row 1 is empty ───
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_TAB}!A1:M1`,
    });
    const row1 = res.data.values?.[0];
    if (!row1 || row1.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range:            `${SHEET_TAB}!A1`,
        valueInputOption: "RAW",
        requestBody:      { values: [HEADERS] },
      });
      console.log("[Sheets] ✅ Headers written to row 1");
    } else {
      console.log("[Sheets] Headers already present — skipping write");
    }

    // ── 2. Set column widths so nothing is cut off ───
    const numericSheetId = await getNumericSheetId(sheets, spreadsheetId);

    const requests = COLUMN_WIDTHS.map((pixelSize, colIndex) => ({
      updateDimensionProperties: {
        range: {
          sheetId:          numericSheetId,
          dimension:        "COLUMNS",
          startIndex:       colIndex,
          endIndex:         colIndex + 1,
        },
        properties:        { pixelSize },
        fields:            "pixelSize",
      },
    }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });

    console.log("[Sheets] ✅ Column widths set — all text visible");
  } catch (err: any) {
    console.error("[Sheets] ensureHeaders error:", err.message);
  }
}

// ─────────────────────────────────────────────
// appendLeadRow
// Appends one row immediately after insertLead.
// Always runs before Slack so the sheet write
// is independent of Slack availability.
// Errors are caught — never throws.
// ─────────────────────────────────────────────
export async function appendLeadRow(lead: Lead): Promise<void> {
  const rawId = process.env.GOOGLE_SHEET_ID?.trim();
  if (!rawId) {
    console.warn("[Sheets] GOOGLE_SHEET_ID not set — skipping lead append");
    return;
  }

  const spreadsheetId = parseSheetId(rawId);

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
      spreadsheetId,
      range:            `${SHEET_TAB}!A:M`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody:      { values: [row] },
    });

    console.log(`[Sheets] ✅ Appended lead: ${lead.business_name}`);
  } catch (err: any) {
    console.error("[Sheets] appendLeadRow error:", err.message);
  }
}
