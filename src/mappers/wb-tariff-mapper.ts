import Tariff from "#models/tariff.js";
import WBBoxTariffResponse from "#dtos/wb-box-tariff.js";

export default class WBTariffMapper {
    public static toModel(tariffDTO: WBBoxTariffResponse, date: string): Tariff[] {
        return (
            tariffDTO?.response?.data?.warehouseList?.map((item) => ({
                receipt_date: date,
                geo_name: item.geoName,
                warehouse_name: item.warehouseName,
                box_delivery_base: this.valueOrNull(item.boxDeliveryBase),
                box_delivery_coef_expr: this.valueOrNull(item.boxDeliveryCoefExpr),
                box_delivery_liter: this.valueOrNull(item.boxDeliveryLiter),
                box_delivery_marketplace_base: this.valueOrNull(item.boxDeliveryMarketplaceBase),
                box_delivery_marketplace_coef_expr: this.valueOrNull(item.boxDeliveryMarketplaceCoefExpr),
                box_delivery_marketplace_liter: this.valueOrNull(item.boxDeliveryMarketplaceLiter),
                box_storage_base: this.valueOrNull(item.boxStorageBase),
                box_storage_coef_expr: this.valueOrNull(item.boxStorageCoefExpr),
                box_storage_liter: this.valueOrNull(item.boxStorageLiter),
            })) ?? []
        );
    }

    private static valueOrNull(val: string): number | null {
        return val !== "-" ? Number(val.replace(",", ".")) : null;
    }
}
