import ITariffRepository from "#repositories/tariff-repository.interface.js";
import Tariff from "#models/tariff.js";
import knex from "#postgres/knex.js";
import DatabaseException from "#exceptions/database-exception.js";

export default class TariffRepository implements ITariffRepository {
    public async upsert(tariffs: Tariff | Tariff[]): Promise<void> {
        try {
            return this._upsert(tariffs);
        } catch (e) {
            throw new DatabaseException("Failed to upsert tariffs", e);
        }
    }

    private async _upsert(tariffs: Tariff | Tariff[]): Promise<void> {
        await knex<Tariff>("tariffs")
            .insert(tariffs)
            .onConflict(["receipt_date", "geo_name", "warehouse_name"])
            .merge({
                box_delivery_base: knex.raw("EXCLUDED.box_delivery_base"),
                box_delivery_coef_expr: knex.raw("EXCLUDED.box_delivery_coef_expr"),
                box_delivery_liter: knex.raw("EXCLUDED.box_delivery_liter"),
                box_delivery_marketplace_base: knex.raw("EXCLUDED.box_delivery_marketplace_base"),
                box_delivery_marketplace_coef_expr: knex.raw("EXCLUDED.box_delivery_marketplace_coef_expr"),
                box_delivery_marketplace_liter: knex.raw("EXCLUDED.box_delivery_marketplace_liter"),
                box_storage_base: knex.raw("EXCLUDED.box_storage_base"),
                box_storage_coef_expr: knex.raw("EXCLUDED.box_storage_coef_expr"),
                box_storage_liter: knex.raw("EXCLUDED.box_storage_liter"),
            });
    }

    public async findByDate(date: string): Promise<Tariff[]> {
        try {
            return this._findByDate(date);
        } catch (e) {
            throw new DatabaseException("Failed to find tariffs", e);
        }
    }

    private async _findByDate(date: string): Promise<Tariff[]> {
        return await knex<Tariff>("tariffs").select().where("receipt_date", date);
    }
}
