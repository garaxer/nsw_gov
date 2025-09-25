import { GeocodeResponse, AdministrativeBoundaryResponse, LocationInfo } from '../types/domain';
import { NotFoundError, InternalServerError } from '../errors/http';

export class AddressService {
  private static readonly GEOCODE_BASE_URL = 'https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Geocoded_Addressing_Theme/FeatureServer/1/query';
  private static readonly BOUNDARY_BASE_URL = 'https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Administrative_Boundaries_Theme/FeatureServer/4/query';

  /**
   * Search for address coordinates using NSW Geocoding API
   */
  async geocodeAddress(address: string): Promise<GeocodeResponse> {
    const encodedAddress = encodeURIComponent(address.toUpperCase());
    const url = `${AddressService.GEOCODE_BASE_URL}?where=address+%3D+%27${encodedAddress}%27&outFields=*&f=geojson`;
    
    console.log('Geocoding request URL:', url);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new InternalServerError(`Geocoding API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as GeocodeResponse;
      
      if (!data.features || data.features.length === 0) {
        throw new NotFoundError(`No results found for address: ${address}`);
      }
      
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof InternalServerError) {
        throw error;
      }
      throw new InternalServerError(`Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get administrative boundary information using coordinates
   */
  async getAdministrativeBoundary(longitude: number, latitude: number): Promise<AdministrativeBoundaryResponse> {
    const url = `${AddressService.BOUNDARY_BASE_URL}?geometry=${longitude}%2C+${latitude}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&f=geoJSON`;
    
    console.log('Administrative boundary request URL:', url);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new InternalServerError(`Administrative boundary API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as AdministrativeBoundaryResponse;
      
      if (!data.features || data.features.length === 0) {
        throw new NotFoundError(`No administrative boundary found for coordinates: ${longitude}, ${latitude}`);
      }
      
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof InternalServerError) {
        throw error;
      }
      throw new InternalServerError(`Failed to get administrative boundary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Main method to lookup complete address information
   */
  async lookupAddress(address: string): Promise<LocationInfo> {
    try {
      console.log('Starting address lookup for:', address);
      
      // Step 1: Geocode the address
      const geocodeResponse = await this.geocodeAddress(address);
      const feature = geocodeResponse.features[0];
      
      const [longitude, latitude] = feature.geometry.coordinates;
      const propertyId = feature.properties.rid;
      const fullAddress = feature.properties.address;
      
      console.log('Geocoded coordinates:', { longitude, latitude });
      
      // Step 2: Get administrative boundary information
      const boundaryResponse = await this.getAdministrativeBoundary(longitude, latitude);
      const boundaryFeature = boundaryResponse.features[0];
      
      const districtName = boundaryFeature.properties.districtname;
      
      console.log('Administrative boundary found:', districtName);
      
      return {
        latitude,
        longitude,
        address: fullAddress,
        suburbName: districtName,
        stateElectoralDistrict: districtName,
        propertyId
      };
      
    } catch (error) {
      console.error('Address lookup error:', error);
      throw error;
    }
  }
}