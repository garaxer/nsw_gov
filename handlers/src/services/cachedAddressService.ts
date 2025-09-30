import { addressCache } from "../utils/cache";
import { lookupAddress } from "./addressService";
import { LocationInfo } from "../types/domain";
import logger from "../utils/logger";

export const cachedLookupAddress = async (
  address: string
): Promise<LocationInfo> => {
  // Check cache first
  const cached = addressCache.get(address);
  if (cached) {
    logger.info("Cache hit for address:", address);
    return cached;
  }

  // Cache miss - fetch from API
  const result = await lookupAddress(address);

  // Store in cache
  addressCache.set(address, result);

  return result;
};
