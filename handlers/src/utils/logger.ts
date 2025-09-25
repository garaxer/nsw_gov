import { Logger } from "@aws-lambda-powertools/logger";
import config from "../config";

const logger = new Logger({
  serviceName: "nsw-address",
  logLevel: config.logLevel.toLowerCase() as
    | "debug"
    | "info"
    | "warn"
    | "error",
});

export default logger;
