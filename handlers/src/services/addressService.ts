import {
  AdministrativeBoundaryResponse,
  GeocodeResponse,
  LocationInfo,
} from "../types/domain";
import { NotFoundError, InternalServerError } from "../errors/http";
import {
  getGeocodedAddress,
  getAdministrativeBoundary,
} from "../clients/nsw-api";

/** Extracts location data from NSW API responses */
export const extractLocationData = (
  geocodeResponse: GeocodeResponse,
  boundaryResponse: AdministrativeBoundaryResponse
): LocationInfo => {
  const feature = geocodeResponse.features[0];
  const [longitude, latitude] = feature.geometry.coordinates;
  const fullAddress = feature.properties.address;

  const boundaryFeature = boundaryResponse.features[0];
  const districtName = boundaryFeature.properties.districtname;

  return {
    latitude,
    longitude,
    address: fullAddress,
    suburbName: districtName,
    stateElectoralDistrict: districtName,
  };
};

/** Extracts coordinates from geocode response */
export const getLatLong = (
  geoCodeResponse: GeocodeResponse
): [number, number] => {
  const feature = geoCodeResponse.features[0];
  return feature.geometry.coordinates;
};

/** Main address lookup function - coordinates geocoding and boundary lookup */
export const lookupAddress = async (address: string): Promise<LocationInfo> => {
  try {
    console.log("Starting address lookup for:", address);

    // Step 1: Get coordinates
    const geocodeResponse = await getGeocodedAddress(address);
    const [longitude, latitude] = getLatLong(geocodeResponse);
    console.log("Geocoded address to coordinates:", { longitude, latitude });

    // Step 2: Get administrative boundary
    const boundaryResponse = await getAdministrativeBoundary(
      longitude,
      latitude
    );
    console.log(
      "Administrative boundary found:",
      boundaryResponse.features[0].properties.districtname
    );

    // Step 3: Extract and return combined data
    return extractLocationData(geocodeResponse, boundaryResponse);
  } catch (error) {
    console.error("Address lookup error:", error);
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
