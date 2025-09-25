import { extractLocationData, getLatLong, lookupAddress } from '../src/services/addressService';
import { getGeocodedAddress, getAdministrativeBoundary } from '../src/clients/nsw-api';
import { InternalServerError } from '../src/errors/http';

jest.mock('../src/clients/nsw-api');
const mockGetGeocodedAddress = getGeocodedAddress as jest.MockedFunction<typeof getGeocodedAddress>;
const mockGetAdministrativeBoundary = getAdministrativeBoundary as jest.MockedFunction<typeof getAdministrativeBoundary>;

describe('AddressService', () => {
  const mockGeocodeResponse = {
    features: [{
      geometry: { coordinates: [149.567, -33.429] },
      properties: { address: '346 PANORAMA AVENUE BATHURST' }
    }]
  };

  const mockBoundaryResponse = {
    features: [{
      properties: { districtname: 'BATHURST' }
    }]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractLocationData', () => {
    it('should extract location data correctly', () => {
      const result = extractLocationData(mockGeocodeResponse as any, mockBoundaryResponse as any);
      
      expect(result).toEqual({
        latitude: -33.429,
        longitude: 149.567,
        address: '346 PANORAMA AVENUE BATHURST',
        suburbName: 'BATHURST',
        stateElectoralDistrict: 'BATHURST'
      });
    });
  });

  describe('getLatLong', () => {
    it('should return coordinates tuple', () => {
      const result = getLatLong(mockGeocodeResponse as any);
      expect(result).toEqual([149.567, -33.429]);
    });
  });

  describe('lookupAddress', () => {
    it.each([
      ['346 PANORAMA AVENUE BATHURST', 'BATHURST'],
      ['1 MARTIN PLACE SYDNEY', 'SYDNEY']
    ])('should lookup address successfully for %s', async (address, district) => {
      const geocodeResponse = {
        features: [{ geometry: { coordinates: [149.567, -33.429] }, properties: { address } }]
      };
      const boundaryResponse = {
        features: [{ properties: { districtname: district } }]
      };

      mockGetGeocodedAddress.mockResolvedValue(geocodeResponse as any);
      mockGetAdministrativeBoundary.mockResolvedValue(boundaryResponse as any);

      const result = await lookupAddress(address);
      expect(result.address).toBe(address);
      expect(result.suburbName).toBe(district);
    });

    it('should throw InternalServerError on unexpected errors', async () => {
      mockGetGeocodedAddress.mockRejectedValue(new Error('Network error'));
      
      await expect(lookupAddress('test address')).rejects.toThrow(InternalServerError);
    });
  });
});