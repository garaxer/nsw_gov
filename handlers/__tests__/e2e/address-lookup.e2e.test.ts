import { AddressLookupResponse, ErrorResponse } from "../../src/types/responses";
import { handler } from "../../lambdas/address";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

// Mock event creator for e2e testing
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
      userAgent: ""
    },
    requestId: "",
    routeKey: "",
    stage: "",
    time: "",
    timeEpoch: 0
  },
  body: undefined,
  isBase64Encoded: false,
  queryStringParameters: query ? { q: query } : undefined,
  pathParameters: undefined,
});

describe("Address Lookup E2E", () => {
  jest.setTimeout(30000);

  it.each([
    ["346 PANORAMA AVENUE BATHURST", "BATHURST"],
    ["1 MARTIN PLACE SYDNEY", "SYDNEY"],
  ])(
    "should handle full address lookup flow for %s",
    async (address, suburb) => {
      const event = createEvent(address);
      const result = (await handler(
        event,
        {} as Context,
        () => {}
      )) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body) as AddressLookupResponse;
      expect(body.address).toContain(address.split(" ")[0]);
      expect(body.location.latitude).toBeDefined();
      expect(body.location.longitude).toBeDefined();
      expect(body.suburbName).toBe(suburb);
    }
  );

  it("should return 400 for missing query parameter", async () => {
    const event = createEvent();
    const result = (await handler(
      event,
      {} as Context,
      {} as () => {}
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);

    const body = JSON.parse(result.body);
    expect(body.error).toContain("Query parameter q is required");
  });

  it("should return 404 for invalid address", async () => {
    const event = createEvent("INVALID ADDRESS THAT DOES NOT EXIST");
    const result = (await handler(
      event,
      {} as Context,
      () => {}
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(404);

    const body = JSON.parse(result.body) as ErrorResponse;
    expect(body.error).toContain("No results found");
  });
});
