import "dotenv/config";
import { APIGatewayProxyHandlerV2, APIGatewayProxyResult } from "aws-lambda";
import Reply from "../src/utils/reply";
import { lookupAddress } from "../src/services/addressService";
import { AddressLookupResponse } from "handlers/src/types/responses";
import config from "handlers/src/config";

/** Lambda handler for NSW address lookup */
export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResult> = async (
  event
) => {
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
        query: query,
      },
      200,
      { cacheMaxAge: config.cacheMaxAge }
    );
  } catch (error) {
    return Reply.fromError(error as Error & { code?: number });
  }
};
