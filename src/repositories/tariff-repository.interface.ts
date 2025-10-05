import Tariff from "#models/tariff.js";

export default interface ITariffRepository {
    findByDate(date: string): Promise<Tariff[]>;
    upsert(tariff: Tariff | Tariff[]): Promise<void>;
}
