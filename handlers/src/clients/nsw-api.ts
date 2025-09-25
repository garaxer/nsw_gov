import config from "../config";
import logger from "../utils/logger";
import {
  GeocodeResponse,
  StateElectoralDistrictResponse,
  SuburbResponse,
} from "../types/domain";
import { NotFoundError, InternalServerError } from "../errors/http";
import {
  parseElectoralSchema,
  parseGeocodeSchema,
  parseSuburbSchema,
} from "./schema";
import fetchWithTimeoutRetry from "./fetchWithTimeoutRetry";

/** Builds the geocoding URL for a given address 
 * e.g. https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Geocoded_Addressing_Theme/FeatureServer/1/query?where=address+%3D+%27346%20PANORAMA%20AVENUE%20BATHURST%27&outFields=*&f=geojson
*/
const buildGeocodeUrl = (address: string) => {
  const safeAddress = address.toUpperCase().replace(/'/g, "''");
  const where = `address = '${safeAddress}'`;
  const qs = new URLSearchParams({ where, outFields: "*", f: "geojson" });
  return `${config.apis.nsw.geocoding.baseUrl}?${qs.toString()}`;
};

/** Builds the point query URL for given coordinates
 * e.g. https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Administrative_Boundaries_Theme/FeatureServer/4/query?geometry=149.56705027261992%2C-33.42968429289573&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&f=geoJSON
*/
const buildPointQueryUrl = (
  baseUrl: string,
  longitude: number,
  latitude: number
) => {
  const geometry = `${longitude},${latitude}`;
  const qs = new URLSearchParams({
    geometry,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "*",
    returnGeometry: "false",
    f: "geoJSON",
  });
  return `${baseUrl}?${qs.toString()}`;
};

/** Fetches geocoded address data from NSW API 
 * @param address - The address to geocode, e.g., "346 PANORAMA AVENUE BATHURST"
 * @returns GeocodeResponse containing features with coordinates and address properties
 * @throws NotFoundError if no results are found
 * @throws InternalServerError for API errors
*/
export const getGeocodedAddress = async (
  address: string
): Promise<GeocodeResponse> => {
  const url = buildGeocodeUrl(address);
  logger.debug("Geocoding request URL", { url });
  const response = await fetchWithTimeoutRetry(url);
  if (!response.ok) {
    throw new InternalServerError(
      `Geocoding API error: ${response.status} ${response.statusText}`
    );
  }
  const json = await response.json();
  const parsed = parseGeocodeSchema(json);
  if (!parsed.features.length) {
    throw new NotFoundError(`No results found for address: ${address}`);
  }
  return parsed;
};

/** Administrative boundary (state electoral district) lookup */
export const getDistrictBoundary = async (
  longitude: number,
  latitude: number
): Promise<StateElectoralDistrictResponse> => {
  const url = buildPointQueryUrl(
    config.apis.nsw.boundariesStateElectoralDistrict.baseUrl,
    longitude,
    latitude
  );
  logger.debug("Boundary request URL", { url });
  const response = await fetchWithTimeoutRetry(url);
  if (!response.ok) {
    throw new InternalServerError(
      `Boundary API error: ${response.status} ${response.statusText}`
    );
  }
  const json = await response.json();
  const parsed = parseElectoralSchema(json);
  if (!parsed.features.length) {
    throw new NotFoundError(
      `No administrative boundary found for coordinates: ${longitude}, ${latitude}`
    );
  }
  return parsed;
};

/** Administrative suburb/locality lookup */
export const getSuburbBoundary = async (
  longitude: number,
  latitude: number
): Promise<SuburbResponse> => {
  const url = buildPointQueryUrl(
    config.apis.nsw.boundariesSuburb.baseUrl,
    longitude,
    latitude
  );
  logger.debug("Suburb request URL", { url });
  const response = await fetchWithTimeoutRetry(url);
  if (!response.ok) {
    throw new InternalServerError(
      `Suburb API error: ${response.status} ${response.statusText}`
    );
  }
  const json = await response.json();
  const parsed = parseSuburbSchema(json);
  if (!parsed.features.length) {
    throw new NotFoundError(
      `No suburb found for coordinates: ${longitude}, ${latitude}`
    );
  }
  return parsed;
};
