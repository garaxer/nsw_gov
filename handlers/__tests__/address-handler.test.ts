import { handler } from "../lambdas/address";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { AddressLookupResponse } from "../src/types/responses";

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock event creator for unit testing
const createEvent = (query?: string): APIGatewayProxyEventV2 => ({
  version: "2.0",
  routeKey: "$default",
  rawPath: "/",
  rawQueryString: query ? `q=${encodeURIComponent(query)}` : "",
  headers: { "content-type": "application/json" },
  requestContext: {
    accountId: "",
    apiId: "",
    domainName: "",
    domainPrefix: "",
    http: {
      method: "GET",
      path: "",
      protocol: "",
      sourceIp: "",
      userAgent: "",
    },
    requestId: "",
    routeKey: "",
    stage: "",
    time: "",
    timeEpoch: 0,
  },
  body: undefined,
  isBase64Encoded: false,
  queryStringParameters: query ? { q: query } : undefined,
  pathParameters: undefined,
});

describe("Address Handler Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully handle address lookup with mocked API responses", async () => {
    const address = "346 PANORAMA AVENUE BATHURST";

    // Mock the three API calls in sequence
    const geocodeResponse = {
      features: [
        {
          id: 3973380,
          geometry: { coordinates: [149.56705027262, -33.4296842928957, 0] },
          properties: { address, principaladdresssiteoid: 555555 },
        },
      ],
    };

    const boundaryResponse = {
      features: [{ properties: { districtname: "BATHURST" } }],
    };

    const suburbResponse = {
      features: [{ properties: { suburbname: "BATHURST" } }],
    };

    // Mock fetch calls in order: geocoding, boundary, suburb
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(geocodeResponse),
      } as unknown as Promise<Response>)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(boundaryResponse),
      } as unknown as Promise<Response>)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(suburbResponse),
      } as unknown as Promise<Response>);

    const event = createEvent(address);
    const result = (await handler(
      event,
      {} as Context,
      () => {}
    )) as APIGatewayProxyResult;

    const body = JSON.parse(result.body) as AddressLookupResponse;
    console.log({ body });
    expect(body.address).toBe(address);
    expect(body.location.latitude).toBe(-33.4296842928957);
    expect(body.location.longitude).toBe(149.56705027262);
    expect(body.suburbName).toBe("BATHURST");
    expect(body.stateElectoralDistrict).toBe("BATHURST");
    expect(body.propertyId).toBe(3973380);
    expect(body.principalAddressSiteOid).toBe(555555);
    expect(body.query).toBe(address);

    // Verify all three API calls were made
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
