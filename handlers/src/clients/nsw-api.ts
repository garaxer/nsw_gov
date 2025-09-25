import config from "../config";
import {
  GeocodeResponse,
  AdministrativeBoundaryResponse,
} from "../types/domain";
import { InternalServerError, NotFoundError } from "../errors/http";

/** Fetches geocoded address data from NSW API 
 * @param address - The address to geocode, e.g., "346 PANORAMA AVENUE BATHURST"
 * @returns GeocodeResponse containing features with coordinates and address properties
 * @throws NotFoundError if no results are found
 * @throws InternalServerError for API errors
 */
export const getGeocodedAddress = async (
  address: string
): Promise<GeocodeResponse> => {
  const encodedAddress = encodeURIComponent(address.toUpperCase());
  const url = `${config.apis.nsw.geocoding.baseUrl}?where=address+%3D+%27${encodedAddress}%27&outFields=*&f=geojson`;

  console.log("Geocoding request URL:", url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new InternalServerError(
      `Geocoding API error: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as GeocodeResponse;

  if (!data.features || data.features.length === 0) {
    throw new NotFoundError(`No results found for address: ${address}`);
  }

  return data;
};

/** Fetches administrative boundary data from NSW API using coordinates
 * @param longitude - The longitude coordinate
 * @param latitude - The latitude coordinate
 * @returns AdministrativeBoundaryResponse containing features with district properties
 * @throws NotFoundError if no boundaries are found for the coordinates
 * @throws InternalServerError for API errors
 */
export const getAdministrativeBoundary = async (
  longitude: number,
  latitude: number
): Promise<AdministrativeBoundaryResponse> => {
  const url = `${config.apis.nsw.boundaries.baseUrl}?geometry=${longitude}%2C+${latitude}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&f=geoJSON`;

  console.log("Administrative boundary request URL:", url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new InternalServerError(
      `Administrative boundary API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new NotFoundError(
      `No administrative boundary found for coordinates: ${longitude}, ${latitude}`
    );
  }

  return data;
};
