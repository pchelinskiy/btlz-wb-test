import axios, { AxiosResponse } from "axios";

import WBBoxTariffResponse from "#dtos/wb-box-tariff.js";
import ExternalServiceException from "#exceptions/external-service-exception.js";

export default class WBClient {
    private readonly path = "/api/v1/tariffs/box";
    constructor(
        private readonly WB_COMMON_URL: string,
        private readonly WB_API_TOKEN: string,
    ) {}

    public async getBoxTariffs(date: string): Promise<WBBoxTariffResponse> {
        try {
            return await this._getBoxTariffs(date);
        } catch (e) {
            throw new ExternalServiceException("Failed to fetch tariffs data", e);
        }
    }

    private async _getBoxTariffs(date: string): Promise<WBBoxTariffResponse> {
        const response = await axios.get<WBBoxTariffResponse>(this.WB_COMMON_URL + this.path, {
            params: {
                date,
            },
            headers: {
                Authorization: "Bearer " + this.WB_API_TOKEN,
            },
        });

        return response.data;
    }
}
