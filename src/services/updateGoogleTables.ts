import PQueue from "p-queue";

import getCurrentDateWithoutTZ from "#utils/date.js";
import logger from "#logger/pino.js";
import GoogleSheetsClient from "#clients/google-client.js";
import GoogleTariffMapper from "#mappers/google-tariff-mapper.js";
import ITariffRepository from "#repositories/tariff-repository.interface.js";
import ISpreadsheetRepository from "#repositories/spreadsheet-repository.interface.js";

export default async function updateGoogleTables(
    tariffRepository: ITariffRepository,
    spreadsheetRepository: ISpreadsheetRepository,
    googleSheetsClient: GoogleSheetsClient,
): Promise<void> {
    logger.info("Sync google tables started");

    const currentDate = getCurrentDateWithoutTZ();
    logger.debug({ currentDate }, "Current date for fetching");

    logger.info("Fetching tariffs from DB...");
    const tariffs = await tariffRepository.findByDate(currentDate);
    logger.info({ count: tariffs.length }, "Number of fetched tariffs");

    if (tariffs.length === 0) {
        logger.warn("No tariffs found to update, exiting");
        return;
    }

    const spreadsheets = await spreadsheetRepository.getAll();
    logger.info({ count: spreadsheets.length }, "Number of tables to update");

    const mappedData = GoogleTariffMapper.fromModel(tariffs);
    logger.debug({ mappedData: mappedData.values.length }, "Mapped data prepared");

    const queue = new PQueue({ concurrency: 2, interval: 1000, intervalCap: 60 });

    let failedUpdates = 0;

    for (const spreadsheet of spreadsheets) {
        queue.add(async () => {
            logger.info({ spreadsheetId: spreadsheet.id }, `Updating sheet "stocks_coefs"`);
            try {
                await googleSheetsClient.upsertSheetData(spreadsheet.id, "stocks_coefs", mappedData);
                logger.info({ spreadsheetId: spreadsheet.id }, "Sheet updated successfully");
            } catch (err) {
                logger.error({ spreadsheetId: spreadsheet.id, err }, "Failed to update sheet");
                failedUpdates++;
                throw err;
            }
        });
    }

    logger.info("Waiting for all sheets to be processed...");
    await queue.onIdle();

    const successUpdates = spreadsheets.length - failedUpdates;
    logger.info(`Sheets processed: ${successUpdates} succeeded, ${failedUpdates} failed`);
}
