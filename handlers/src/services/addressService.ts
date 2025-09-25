import {
  StateElectoralDistrictResponse,
  GeocodeResponse,
  LocationInfo,
} from "../types/domain";
import { NotFoundError, InternalServerError } from "../errors/http";
import {
  getGeocodedAddress,
  getDistrictBoundary,
  getSuburbBoundary,
} from "../clients/nsw-api";
import logger from "../utils/logger";
import { SuburbResponse } from "../types/domain";

/** Extracts location data from NSW API responses */
export const extractLocationData = (
  geocodeResponse: GeocodeResponse,
  boundaryResponse: StateElectoralDistrictResponse,
  suburbResponse: SuburbResponse
): LocationInfo => {
  const feature = geocodeResponse.features[0];
  const [longitude, latitude] = feature.geometry.coordinates;
  const fullAddress = feature.properties.address;
  const propertyId = feature.id;

  const boundaryFeature = boundaryResponse.features[0];
  const districtName = boundaryFeature.properties.districtname;

  const suburbFeature = suburbResponse.features[0];
  const suburbName = suburbFeature.properties.suburbname;

  return {
    latitude,
    longitude,
    address: fullAddress,
    suburbName,
    stateElectoralDistrict: districtName,
    propertyId,
  };
};

/** Extracts coordinates from geocode response */
export const getLatLong = (
  geoCodeResponse: GeocodeResponse
): [number, number] => {
  const feature = geoCodeResponse.features[0];
  const [lng, lat] = feature.geometry.coordinates;
  return [lng, lat];
};

/** Main address lookup function - coordinates geocoding and boundary + suburb lookup */
export const lookupAddress = async (address: string): Promise<LocationInfo> => {
  logger.info("Starting address lookup", { address });
  try {
    // Step 1: Get coordinates
    const geocodeResponse = await getGeocodedAddress(address);
    const [longitude, latitude] = getLatLong(geocodeResponse);
    logger.debug("Geocoded coordinates", { longitude, latitude });

    // Step 2a: Get administrative boundary (state electoral district and suburb/locality)
    const [boundaryResponse, suburbResponse] = await Promise.all([
      getDistrictBoundary(longitude, latitude),
      getSuburbBoundary(longitude, latitude),
    ]);

    // Step 3: Extract and return combined data
    const combined = extractLocationData(
      geocodeResponse,
      boundaryResponse,
      suburbResponse
    );
    logger.info("Lookup successful", {
      address: combined.address,
      suburb: combined.suburbName,
      district: combined.stateElectoralDistrict,
    });
    return combined;
  } catch (error) {
    logger.error("Address lookup error", {
      error: error instanceof Error ? error.message : String(error),
    });
    if (
      error instanceof NotFoundError ||
      error instanceof InternalServerError
    ) {
      throw error;
    }
    throw new InternalServerError(
      `Failed to lookup address: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
