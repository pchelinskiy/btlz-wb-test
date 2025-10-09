import GoogleSheetsClient from "#clients/google-client.js";
import WBClient from "#clients/wb-client.impl.js";
import env from "#config/env/env.js";
import logger from "#logger/pino.js";
import { migrate, seed } from "#postgres/knex.js";
import SpreadsheetRepository from "#repositories/knex/spreadsheet-repository.impl.js";
import TariffRepository from "#repositories/knex/tariff-repository.impl.js";
import ISpreadsheetRepository from "#repositories/spreadsheet-repository.interface.js";
import ITariffRepository from "#repositories/tariff-repository.interface.js";
import fetchTariffs from "#services/fetchTariffs.js";
import updateGoogleTables from "#services/updateGoogleTables.js";
import setAsyncInterval from "#utils/async-inteval.js";

class App {
    private tariffRepository!: ITariffRepository;
    private spreadsheetRepository!: ISpreadsheetRepository;
    private googleSheetsClient!: GoogleSheetsClient;
    private wbClient!: WBClient;

    constructor() {}

    async start() {
        await this.prepareDB();

        this.initializeRepos();
        this.initializeClients();

        this.startFetchingTariffsWithInterval(60);
        this.startUpdateTables(60);
    }

    private async prepareDB(): Promise<void> {
        await migrate.latest();
        await seed.run();

        logger.info("All migrations and seeds have been run");
    }

    private initializeRepos() {
        this.tariffRepository = new TariffRepository();
        this.spreadsheetRepository = new SpreadsheetRepository();
    }

    private initializeClients() {
        this.googleSheetsClient = new GoogleSheetsClient();
        this.wbClient = new WBClient(env.WB_COMMON_URL, env.WB_API_TOKEN);
    }

    private startFetchingTariffsWithInterval(minutes: number): void {
        setAsyncInterval(() => fetchTariffs(this.tariffRepository, this.wbClient), minutes * 60 * 1000);
    }

    private startUpdateTables(minutes: number): void {
        setTimeout(() => setAsyncInterval(() => updateGoogleTables(this.tariffRepository, this.spreadsheetRepository, this.googleSheetsClient), minutes * 60 * 1000), 5000);
    }

    // TODO: add global error handler for scheduled jobs
}

new App().start();
