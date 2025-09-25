import config from "../config";
import logger from "../utils/logger";

// Default headers for NSW API requests
const defaultRequestHeaders: Record<string, string> = {
  Accept: "application/json",
  "User-Agent": "nsw-address-lambda",
};

// Basic fetch with timeout and single retry (configurable)
const fetchWithTimeoutRetry = async (
  url: string,
  opts: { timeoutMs: number; retryAttempts: number } = config.http
): Promise<Response> => {
  let attempt = 0;
  const { timeoutMs, retryAttempts } = opts;

  while (true) {
    attempt += 1;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          ...defaultRequestHeaders,
        },
        signal: controller.signal,
      } as Parameters<typeof fetch>[1]);
      clearTimeout(timer);

      // Retry on 429 only
      if (response.status === 429 && attempt <= retryAttempts) {
        logger.warn("HTTP 429 received, retrying once", { url, attempt });
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }

      return response;
    } catch (error: unknown) {
      clearTimeout(timer);
      const isAbortError = (error as { name?: string })?.name === "AbortError";

      if (isAbortError && attempt <= retryAttempts) {
        logger.warn("Request timed out, retrying once", { url, attempt });
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }

      throw error;
    }
  }
};

export default fetchWithTimeoutRetry;