import {
  getGeocodedAddress,
  getAdministrativeBoundary,
} from "../src/clients/nsw-api";
import { NotFoundError, InternalServerError } from "../src/errors/http";

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("NSW API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getGeocodedAddress", () => {
    it.each([["346 PANORAMA AVENUE BATHURST"], ["1 MARTIN PLACE SYDNEY"]])(
      "should geocode address: %s",
      async (address: string) => {
        const mockResponse = {
          features: [
            {
              geometry: { coordinates: [149.567, -33.429] },
              properties: { address },
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        } as unknown as Promise<Response>);

        const result = await getGeocodedAddress(address);
        expect(result.features).toHaveLength(1);
        expect(result.features[0].properties.address).toBe(address);
      }
    );

    it("should throw NotFoundError when no features returned", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ features: [] }),
      } as unknown as Promise<Response>);

      await expect(getGeocodedAddress("INVALID ADDRESS")).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw InternalServerError on API failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      } as unknown as Promise<Response>);

      await expect(getGeocodedAddress("test address")).rejects.toThrow(
        InternalServerError
      );
    });
  });

  describe("getAdministrativeBoundary", () => {
    it.each([
      [149.567, -33.429, "BATHURST"],
      [151.209, -33.867, "SYDNEY"],
    ])(
      "should get boundary for coordinates %f, %f",
      async (lng, lat, district) => {
        const mockResponse = {
          features: [{ properties: { districtname: district } }],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        } as unknown as Promise<Response>);

        const result = await getAdministrativeBoundary(lng, lat);
        expect(result.features[0].properties.districtname).toBe(district);
      }
    );

    it("should throw NotFoundError when no boundary found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ features: [] }),
      } as unknown as Promise<Response>);

      await expect(getAdministrativeBoundary(0, 0)).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
