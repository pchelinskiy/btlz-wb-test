/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.schema.createTable("tariffs", (table) => {
        table.uuid("record_id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.date("receipt_date").notNullable();
        table.string("geo_name").notNullable();
        table.string("warehouse_name").notNullable();
        table.decimal("box_delivery_base", 10, 2);
        table.decimal("box_delivery_coef_expr", 10, 2);
        table.decimal("box_delivery_liter", 10, 2);
        table.decimal("box_delivery_marketplace_base", 10, 2);
        table.decimal("box_delivery_marketplace_coef_expr", 10, 2);
        table.decimal("box_delivery_marketplace_liter", 10, 2);
        table.decimal("box_storage_base", 10, 2);
        table.decimal("box_storage_coef_expr", 10, 2);
        table.decimal("box_storage_liter", 10, 2);
        table.timestamp("created_at", { useTz: false }).notNullable().defaultTo(knex.fn.now());
        table.timestamp("updated_at", { useTz: false }).notNullable().defaultTo(knex.fn.now());

        table.index("receipt_date");
        table.unique(["receipt_date", "geo_name", "warehouse_name"]);
    });

    await knex.raw(`
      CREATE TRIGGER update_tariffs_updated_at
      BEFORE UPDATE ON tariffs
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    await knex.raw(`DROP TRIGGER IF EXISTS update_tariffs_updated_at ON tariffs`);
    return knex.schema.dropTable("tariffs");
}
