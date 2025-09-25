import { AddressService } from '../src/services/address';

// Mock fetch globally
global.fetch = jest.fn();

describe('AddressService', () => {
  let addressService: AddressService;
  
  beforeEach(() => {
    addressService = new AddressService();
    jest.clearAllMocks();
  });

  describe('geocodeAddress', () => {
    it('should successfully geocode a valid address', async () => {
      const mockGeocodeResponse = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 3973380,
            geometry: {
              type: 'Point',
              coordinates: [149.56705027262, -33.4296842928957, 0]
            },
            properties: {
              rid: 3973380,
              address: '346 PANORAMA AVENUE BATHURST',
              housenumber: '346',
              gurasid: 80490381
            }
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockGeocodeResponse)
      });

      const result = await addressService.geocodeAddress('346 PANORAMA AVENUE BATHURST');
      
      expect(result).toEqual(mockGeocodeResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('346%20PANORAMA%20AVENUE%20BATHURST')
      );
    });

    it('should throw error when address not found', async () => {
      const mockEmptyResponse = {
        type: 'FeatureCollection',
        features: []
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockEmptyResponse)
      });

      await expect(
        addressService.geocodeAddress('INVALID ADDRESS')
      ).rejects.toThrow('No results found for address: INVALID ADDRESS');
    });
  });

  describe('getAdministrativeBoundary', () => {
    it('should successfully get administrative boundary', async () => {
      const mockBoundaryResponse = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 6150,
            geometry: null,
            properties: {
              rid: 6150,
              districtname: 'BATHURST',
              urbanity: 'R'
            }
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockBoundaryResponse)
      });

      const result = await addressService.getAdministrativeBoundary(149.56705027262, -33.4296842928957);
      
      expect(result).toEqual(mockBoundaryResponse);
    });
  });

  describe('lookupAddress', () => {
    it('should successfully lookup complete address information', async () => {
      const mockGeocodeResponse = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 3973380,
            geometry: {
              type: 'Point',
              coordinates: [149.56705027262, -33.4296842928957, 0]
            },
            properties: {
              rid: 3973380,
              address: '346 PANORAMA AVENUE BATHURST',
              housenumber: '346',
              gurasid: 80490381
            }
          }
        ]
      };

      const mockBoundaryResponse = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 6150,
            geometry: null,
            properties: {
              rid: 6150,
              districtname: 'BATHURST',
              urbanity: 'R'
            }
          }
        ]
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockGeocodeResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockBoundaryResponse)
        });

      const result = await addressService.lookupAddress('346 PANORAMA AVENUE BATHURST');
      
      expect(result).toEqual({
        latitude: -33.4296842928957,
        longitude: 149.56705027262,
        address: '346 PANORAMA AVENUE BATHURST',
        suburbName: 'BATHURST',
        stateElectoralDistrict: 'BATHURST',
        propertyId: 3973380
      });
    });
  });
});