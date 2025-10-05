import sheets from "@googleapis/sheets";

import GoogleSheetsUpsert from "#dtos/google-sheets-upsert.js";
import logger from "#logger/pino.js";
import ExternalServiceException from "#exceptions/external-service-exception.js";
import env from "#config/env/env.js";

export default class GoogleSheetsClient {
    private sheets: ReturnType<typeof sheets.sheets>;
    constructor() {
        const jwtOptions = {
            email: env.CLIENT_EMAIL,
            key: env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
            keyId: env.PRIVATE_KEY_ID,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        };

        const authClient = new sheets.auth.JWT(jwtOptions);

        this.sheets = sheets.sheets({
            version: "v4",
            auth: authClient,
        });
    }

    public async upsertSheetData(spreadsheetId: string, sheetTitle: string, dto: GoogleSheetsUpsert) {
        try {
            await this.writeValues(spreadsheetId, sheetTitle, dto);
        } catch (e) {
            if (this.isMissingSheetError(e)) {
                logger.warn(`[Sheets] Sheet "${sheetTitle}" not found. Creating...`);
                await this.createSheet(spreadsheetId, sheetTitle);
                await this.writeValues(spreadsheetId, sheetTitle, dto);
            } else {
                throw new ExternalServiceException(`Failed upserting google table with id ${spreadsheetId}`, e);
            }
        }
    }

    private isMissingSheetError(err: any) {
        const message = err?.errors?.[0]?.message || err?.message || "";
        return message.includes("Unable to parse range") || message.includes("Invalid sheet name") || message.includes("Requested entity was not found");
    }

    private async writeValues(spreadsheetId: string, sheetTitle: string, dto: GoogleSheetsUpsert) {
        this.executeWithRetry(() =>
            this.sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: `${sheetTitle}!A1`,
                valueInputOption: "RAW",
                requestBody: { values: dto.values },
            }),
        );
    }

    private async createSheet(spreadsheetId: string, sheetTitle: string) {
        this.executeWithRetry(() =>
            this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: spreadsheetId,
                requestBody: {
                    requests: [{ addSheet: { properties: { title: sheetTitle } } }],
                },
            }),
        );
    }

    private async executeWithRetry<T>(fn: () => Promise<T>, retries = 5, delayMs = 1000): Promise<T> {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await fn();
            } catch (err: any) {
                if (err.code === 429 || err.message?.includes("Rate Limit")) {
                    const backoff = delayMs * Math.pow(2, attempt);
                    logger.warn(`[Sheets] Rate limit hit, retrying in ${backoff}ms...`);
                    await new Promise((res) => setTimeout(res, backoff));
                } else {
                    throw err;
                }
            }
        }
        throw new Error("Max retries reached for Google Sheets request");
    }
}
