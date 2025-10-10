import GoogleSheetsClient from "#google-client/google-client.js";
import WBClient from "#wb-client/wb-client.js";
import env from "#config/env/env.js";
import logger from "#logger/pino.js";
import { migrate, seed } from "#postgres/knex.js";
import SpreadsheetRepository from "#repositories/knex/spreadsheet-repository.impl.js";
import TariffRepository from "#repositories/knex/tariff-repository.impl.js";
import ISpreadsheetRepository from "#repositories/spreadsheet-repository.interface.js";
import ITariffRepository from "#repositories/tariff-repository.interface.js";
import fetchTariffs from "#services/fetchTariffs.js";
import updateGoogleTables from "#services/updateGoogleTables.js";
import setAsyncInterval from "#utils/async-interval.js";

import EventEmitter from "node:events";

class App extends EventEmitter {
    private tariffRepository!: ITariffRepository;
    private spreadsheetRepository!: ISpreadsheetRepository;
    private googleSheetsClient!: GoogleSheetsClient;
    private wbClient!: WBClient;

    async start() {
        await this.prepareDB();

        this.initializeRepos();
        this.initializeClients();

        this.scheduleFetchingTariffs(60);
        this.once("tariffs-uploaded", () => this.scheduleTableUpdates(60));
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
        this.googleSheetsClient = new GoogleSheetsClient({ email: env.CLIENT_EMAIL, key: env.PRIVATE_KEY, keyId: env.PRIVATE_KEY_ID });
        this.wbClient = new WBClient(env.WB_COMMON_URL, env.WB_API_TOKEN);
    }

    private scheduleFetchingTariffs(minutes: number): void {
        const intervalMs = minutes * 60 * 1000;
        const job = async () => {
            await this.withErrorHandling("fetchWBBoxTariffs", async () => {
                await fetchTariffs(this.tariffRepository, this.wbClient);
                this.emit("tariffs-uploaded");
            });
        };

        setAsyncInterval(job, intervalMs);
        logger.info(`Scheduled WB box tariff fetchinf every ${minutes} minutes`);
    }

    private scheduleTableUpdates(minutes: number): void {
        const intervalMs = minutes * 60 * 1000;
        const job = async () => {
            await this.withErrorHandling("updateGoogleTables", () =>
                updateGoogleTables(this.tariffRepository, this.spreadsheetRepository, this.googleSheetsClient),
            );
        };

        setAsyncInterval(job, intervalMs);
        logger.info(`Scheduled table updates every ${minutes} minutes`);
    }

    private async withErrorHandling(jobName: string, task: () => Promise<void>): Promise<void> {
        try {
            await task();
        } catch (error) {
            logger.error({ error, jobName }, "Error during scheduled job");
        }
    }
}

new App().start();
