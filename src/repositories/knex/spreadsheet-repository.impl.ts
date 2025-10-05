import ISpreadsheetRepository from "#repositories/spreadsheet-repository.interface.js";
import Spreadsheet from "#models/spreadsheet.js";
import knex from "#postgres/knex.js";
import DatabaseException from "#exceptions/database-exception.js";

export default class SpreadsheetRepository implements ISpreadsheetRepository {
    public async getAll(): Promise<Spreadsheet[]> {
        try {
            return this._getAll();
        } catch (e) {
            throw new DatabaseException("Failed to find spreadsheets", e);
        }
    }

    private async _getAll(): Promise<Spreadsheet[]> {
        return knex<Spreadsheet>("spreadsheets").select();
    }
}
