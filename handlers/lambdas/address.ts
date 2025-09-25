import "dotenv/config";
import { APIGatewayProxyHandlerV2, APIGatewayProxyResult } from "aws-lambda";
import Reply from "../src/utils/reply";
import { lookupAddress } from "../src/services/addressService";
import { AddressLookupResponse } from "../src/types/responses";
import config from "../src/config";

/** Lambda handler for NSW address lookup */
export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResult> = async (
  event
) => {
  // Preflight CORS
  if (event.requestContext.http?.method === "OPTIONS") {
    return Reply.noContent({ corsEnabled: true, cacheMaxAge: 0 });
  }

  const queryParams = event.queryStringParameters ?? {};
  const query = queryParams.q ?? queryParams.query ?? queryParams.address ?? "";

  console.log("Address search query:", query);

  // Validate required parameters
  if (!query || query.trim().length === 0) {
    return Reply.badRequest(
      "Query parameter q is required and cannot be empty (e.g., ?q=43 DAINTREE DRIVE WATTLE GROVE)"
    );
  }

  try {
    const result = await lookupAddress(query.trim());

    return Reply.success<AddressLookupResponse>(
      {
        location: {
          latitude: result.latitude,
          longitude: result.longitude,
        },
        address: result.address,
        suburbName: result.suburbName,
        stateElectoralDistrict: result.stateElectoralDistrict,
        propertyId: result.propertyId,
        query: query,
      },
      200,
      { cacheMaxAge: config.cacheMaxAge }
    );
  } catch (error) {
    return Reply.fromError(error as Error & { code?: number });
  }
};
