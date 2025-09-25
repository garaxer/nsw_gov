import {
  extractLocationData,
  getLatLong,
  lookupAddress,
} from "../src/services/addressService";
import {
  getGeocodedAddress,
  getDistrictBoundary,
  getSuburbBoundary,
} from "../src/clients/nsw-api";
import { InternalServerError } from "../src/errors/http";
import {
  StateElectoralDistrictResponse,
  GeocodeResponse,
  SuburbResponse,
} from "../src/types/domain";

jest.mock("../src/clients/nsw-api");
const mockGetGeocodedAddress = getGeocodedAddress as jest.MockedFunction<
  typeof getGeocodedAddress
>;
const mockGetDistrictBoundary =
  getDistrictBoundary as jest.MockedFunction<
    typeof getDistrictBoundary
  >;
const mockGetSuburbBoundary =
  getSuburbBoundary as jest.MockedFunction<
    typeof getSuburbBoundary
  >;

describe("AddressService", () => {
  const mockGeocodeResponse = {
    features: [
      {
        id: 12345,
        geometry: { coordinates: [149.567, -33.429] },
        properties: { address: "346 PANORAMA AVENUE BATHURST", principaladdresssiteoid: 777777 },
      },
    ],
  };

  const mockBoundaryResponse = {
    features: [
      {
        properties: { districtname: "BATHURST" },
      },
    ],
  };

  const mockSuburbResponse = {
    features: [
      {
        properties: { suburbname: "BATHURSTSuburb" },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("extractLocationData", () => {
    it("should extract location data correctly", () => {
      const result = extractLocationData(
        mockGeocodeResponse as GeocodeResponse,
        mockBoundaryResponse as StateElectoralDistrictResponse,
        mockSuburbResponse as SuburbResponse
      );

      expect(result).toEqual({
        latitude: -33.429,
        longitude: 149.567,
        address: "346 PANORAMA AVENUE BATHURST",
        suburbName: "BATHURSTSuburb",
        stateElectoralDistrict: "BATHURST",
        propertyId: 12345,
        principalAddressSiteOid: 777777,
      });
    });
  });

  describe("getLatLong", () => {
    it("should return coordinates tuple", () => {
      const result = getLatLong(mockGeocodeResponse as GeocodeResponse);
      expect(result).toEqual([149.567, -33.429]);
    });
  });

  describe("lookupAddress", () => {
    it.each([
      ["346 PANORAMA AVENUE BATHURST", "BATHURST", "BATHURSTSuburb", 2222],
      ["1 MARTIN PLACE SYDNEY", "SYDNEY", "SYDNEYSuburb", 3333],
    ])(
      "should lookup address successfully for %s",
      async (address, district, suburb, pasOid) => {
        const geocodeResponse = {
          features: [
            {
              id: 4,
              geometry: { coordinates: [149.567, -33.429] },
              properties: { address, principaladdresssiteoid: pasOid },
            },
          ],
        };
        const boundaryResponse = {
          features: [{ properties: { districtname: district } }],
        };
        const suburbResponse = {
          features: [{ properties: { suburbname: suburb } }],
        };
        mockGetGeocodedAddress.mockResolvedValue(
          geocodeResponse as GeocodeResponse
        );
        mockGetDistrictBoundary.mockResolvedValue(
          boundaryResponse as StateElectoralDistrictResponse
        );
        mockGetSuburbBoundary.mockResolvedValue(
          suburbResponse as SuburbResponse
        );
        const result = await lookupAddress(address);
        expect(result.address).toBe(address);
        expect(result.suburbName).toBe(suburb);
        expect(result.principalAddressSiteOid).toBe(pasOid);
      }
    );

    it("should throw InternalServerError on unexpected errors", async () => {
      mockGetGeocodedAddress.mockRejectedValue(new Error("Network error"));

      await expect(lookupAddress("test address")).rejects.toThrow(
        InternalServerError
      );
    });
  });
});
