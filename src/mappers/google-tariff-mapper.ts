import GoogleSheetsUpsert from "#dtos/google-sheets-upsert.js";
import Tariff from "#models/tariff.js";

export default class GoogleTariffMapper {
    public static fromModel(tariffs: Tariff[]): GoogleSheetsUpsert {
        const header = [
            "Страна, для РФ — округ",
            "Название склада",
            "Логистика, первый литр, ₽",
            "Коэффициент Логистика, %",
            "Логистика, дополнительный литр, ₽",
            "Логистика FBS, первый литр, ₽",
            "Коэффициент FBS, %",
            "Логистика FBS, дополнительный литр, ₽",
            "Хранение в день, первый литр, ₽",
            "Коэффициент Хранение, %",
            "Хранение в день, дополнительный литр, ₽",
        ];

        const sortedTariffs = this.sortTariffs(tariffs);

        const values = [
            header,
            ...sortedTariffs.map((t) => [
                t.geo_name,
                t.warehouse_name,
                t.box_delivery_base,
                t.box_delivery_coef_expr,
                t.box_delivery_liter,
                t.box_delivery_marketplace_base,
                t.box_delivery_marketplace_coef_expr,
                t.box_delivery_marketplace_liter,
                t.box_storage_base,
                t.box_storage_coef_expr,
                t.box_storage_liter,
            ]),
        ];

        return {
            values,
        };
    }

    private static sortTariffs(tariffs: Tariff[]): Tariff[] {
        const keys: (keyof Tariff)[] = ["box_delivery_coef_expr", "box_delivery_marketplace_coef_expr", "box_storage_coef_expr"];

        return [...tariffs].sort((a, b) => {
            for (const key of keys) {
                const valA = Number(a[key]);
                const valB = Number(b[key]);
                if (valA < valB) return -1;
                if (valA > valB) return 1;
            }
            return 0;
        });
    }
}
