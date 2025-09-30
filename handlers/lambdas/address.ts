import "dotenv/config";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Reply from "../src/utils/reply";
import { AddressLookupResponse } from "../src/types/responses";
import config from "../src/config";
import { cachedLookupAddress } from "../src/services/cachedAddressService";

/** Lambda handler for NSW address lookup */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return Reply.success("OK", 200);
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
    const result = await cachedLookupAddress(query.trim());

    return Reply.success<AddressLookupResponse>(
      {
        ...result,
        query: query,
      },
      200,
      { cacheMaxAge: config.cacheMaxAge }
    );
  } catch (error) {
    return Reply.fromError(error as Error & { code?: number });
  }
};
