import "dotenv/config";
import config from "../src/config/index";
import { APIGatewayProxyHandlerV2, APIGatewayProxyResult } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResult> = async (
  event
) => {
  console.log("Event", { event, config });

  // Extract query parameters
  const queryParams = event.queryStringParameters || {};
  const query = queryParams.q || '';
  
  console.log("Query parameters:", queryParams);
  console.log("Search query:", query);

  // Validate required parameters
  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: "Missing required parameter", 
        message: "Please provide a 'q' query parameter",
        example: "?q=123 Main Street, Sydney NSW"
      }),
    };
  }

  

  return new Promise<APIGatewayProxyResult>((resolve) =>
    resolve({
      statusCode: 200,
      body: JSON.stringify({ 
        message: "Address search request received",
        query: query,
        allParams: queryParams
      }),
    })
  );
};
