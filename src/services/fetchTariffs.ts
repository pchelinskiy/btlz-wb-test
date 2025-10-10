import WBClient from "#wb-client/wb-client.js";
import WBTariffMapper from "#mappers/wb-tariff-mapper.js";
import ITariffRepository from "#repositories/tariff-repository.interface.js";
import getCurrentDateWithoutTZ from "#utils/date.js";
import logger from "#logger/pino.js";

export default async function fetchTariffs(tariffRepository: ITariffRepository, WBClient: WBClient): Promise<void> {
    logger.info("Fetching tariffs data started");

    const currentDate = getCurrentDateWithoutTZ();
    logger.debug({ currentDate }, "Current date for request");

    logger.info("Requesting WB API...");
    const responseData = await WBClient.getBoxTariffs(currentDate);
    logger.info("WB API responded successfully");

    const tariffs = WBTariffMapper.toModel(responseData, currentDate);
    logger.info({ count: tariffs.length }, "Mapped tariffs from API");

    if (tariffs.length === 0) {
        logger.warn("No tariffs found to update, exiting");
        return;
    }

    await tariffRepository.upsert(tariffs);
    logger.info("Tariffs successfully upserted into database");
}
