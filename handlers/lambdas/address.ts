import "dotenv/config";
import { APIGatewayProxyHandlerV2, APIGatewayProxyResult } from "aws-lambda";
import reply from "../src/utils/reply";
import { AddressService } from "handlers/src/services/address";

export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResult> = async (
  event
) => {
  const queryParams = event.queryStringParameters || {};
  const query = queryParams.q || queryParams.query || queryParams.address || "";

  console.log("Address search query:", query);

  // Validate required parameters
  if (!query || query.trim().length === 0) {
    return reply.badRequest(
      "Query parameter q is required and cannot be empty (e.g., ?q=123 Main Street, Sydney)"
    );
  }

  try {
    const addressService = new AddressService();
    const result = await addressService.lookupAddress(query.trim());

    return reply.success({
      location: {
        latitude: result.latitude,
        longitude: result.longitude,
      },
      address: result.address,
      suburbName: result.suburbName,
      stateElectoralDistrict: result.stateElectoralDistrict,
      propertyId: result.propertyId,
      query: query,
    });
  } catch (error) {
    console.error("Address lookup failed:", error);
    return reply.fromError(error as Error & { code?: number });
  }
};
