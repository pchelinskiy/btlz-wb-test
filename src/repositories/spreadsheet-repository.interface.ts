import Spreadsheet from "#models/spreadsheet.js";

export default interface ISpreadsheetRepository {
    getAll(): Promise<Spreadsheet[]>;
}
