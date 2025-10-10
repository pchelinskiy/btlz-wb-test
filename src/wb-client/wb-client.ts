import axios from "axios";

import WBBoxTariffResponse from "#wb-client/wb-box-tariff.js";
import ExternalServiceException from "#exceptions/external-service-exception.js";
import logger from "#logger/pino.js";

export default class WBClient {
    private readonly path = "/api/v1/tariffs/box";
    constructor(
        private readonly WB_COMMON_URL: string,
        private readonly WB_API_TOKEN: string,
    ) {}

    public async getBoxTariffs(date: string): Promise<WBBoxTariffResponse> {
        try {
            return await this._getBoxTariffs(date);
        } catch (err) {
            throw new ExternalServiceException("Failed to fetch tariffs data", err);
        }
    }

    private async _getBoxTariffs(date: string): Promise<WBBoxTariffResponse> {
        const response = await this.executeWithRetry(() => {
            return axios.get<WBBoxTariffResponse>(this.WB_COMMON_URL + this.path, {
                params: {
                    date,
                },
                headers: {
                    Authorization: "Bearer " + this.WB_API_TOKEN,
                },
            });
        });

        return response.data;
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
        throw new Error("Max retries reached for WB API request");
    }
}
