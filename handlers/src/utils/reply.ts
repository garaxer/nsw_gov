import { APIGatewayProxyResult } from "aws-lambda";

export type LambdaResponseOptions = {
  headers?: Record<string, string>;
  corsEnabled?: boolean;
  cacheMaxAge?: number; // Cache duration in seconds
};

/**
 * Utility class for generating standardized API Gateway responses
 * with support for CORS and caching headers.
 */
class Reply {
  private static getDefaultHeaders(
    corsEnabled = true,
    cacheMaxAge?: number
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (corsEnabled) {
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Headers"] = "Content-Type";
      headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    }

    // Add caching headers if specified
    if (cacheMaxAge) {
      headers["Cache-Control"] = `public, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge}`;
      headers["Expires"] = new Date(Date.now() + cacheMaxAge * 1000).toUTCString();
    }

    return headers;
  }

  static success<T>(
    data: T,
    statusCode: number = 200,
    options?: Partial<LambdaResponseOptions>
  ): APIGatewayProxyResult {
    return {
      statusCode,
      headers: {
        ...this.getDefaultHeaders(options?.corsEnabled, options?.cacheMaxAge),
        ...options?.headers,
      },
      body: JSON.stringify(data),
    };
  }

  static noContent(options?: Partial<LambdaResponseOptions>): APIGatewayProxyResult {
    return {
      statusCode: 204,
      headers: {
        ...this.getDefaultHeaders(options?.corsEnabled, options?.cacheMaxAge),
        ...options?.headers,
      },
      body: "",
    };
  }

  static error(
    error: string,
    statusCode: number = 500,
    options?: Partial<LambdaResponseOptions>
  ): APIGatewayProxyResult {
    return {
      statusCode,
      headers: {
        ...this.getDefaultHeaders(options?.corsEnabled),
        ...options?.headers,
      },
      body: JSON.stringify({ error }),
    };
  }

  static badRequest(
    message: string,
    options?: Partial<LambdaResponseOptions>
  ): APIGatewayProxyResult {
    return this.error(message, 400, options);
  }

  static notFound(
    message: string,
    options?: Partial<LambdaResponseOptions>
  ): APIGatewayProxyResult {
    return this.error(message, 404, options);
  }

  static internalServerError(
    message: string = "Internal server error",
    options?: Partial<LambdaResponseOptions>
  ): APIGatewayProxyResult {
    return this.error(message, 500, options);
  }

  static fromError(
    error: Error & { code?: number },
    options?: Partial<LambdaResponseOptions>
  ): APIGatewayProxyResult {
    const statusCode = error.code ?? 500;
    return this.error(error.message, statusCode, options);
  }
}

export default Reply;
