import config from "../config";
import {
  GeocodeResponse,
  AdministrativeBoundaryResponse,
} from "../types/domain";
import { InternalServerError, NotFoundError } from "../errors/http";

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
