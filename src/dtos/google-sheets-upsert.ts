export default interface GoogleSheetsUpsert {
    values: Simple[][];
}

type Simple = string | number | boolean | bigint | null;
