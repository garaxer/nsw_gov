import "dotenv/config";
import config from "../src/config/index";
import { APIGatewayProxyHandlerV2, APIGatewayProxyResult } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResult> = async (
  event
) => {
  console.log("Event", { event, config });

  return new Promise<APIGatewayProxyResult>((resolve) =>
    resolve({
      statusCode: 200,
      body: JSON.stringify({ body: "Hello World" }),
    })
  );
};
