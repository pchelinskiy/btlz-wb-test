import { pinoConfig } from "#config/pino/pino.js";
import pino from "pino";

const logger = pino(pinoConfig);

export default logger;
