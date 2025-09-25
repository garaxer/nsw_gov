import config from "../config";
import logger from "../utils/logger";

// Default headers for NSW API requests
const defaultRequestHeaders: Record<string, string> = {
  Accept: "application/json",
  "User-Agent": "nsw-address-lambda",
};

/**
 * Performs an HTTP fetch request with support for timeout and retry logic.
 *
 * - Attempts to fetch the specified URL with a timeout for each request.
 * - If the request times out or receives a 429 (Too Many Requests) response,
 *   it will retry up to the specified number of attempts.
 * - Uses an AbortController to enforce the timeout for each request.
 * - Waits 300ms before retrying after a timeout or 429 response.
 * - Returns the successful Response object, or throws an error if all retries fail.
 *
 * @param url - The URL to fetch.
 * @param opts - Options for the request:
 *   - timeoutMs: The timeout in milliseconds for each request attempt.
 *   - retryAttempts: The maximum number of retry attempts on timeout or 429 response.
 *   Defaults to values from `config.http`.
 * @returns A Promise that resolves to the fetch Response object.
 * @throws Throws if all retry attempts fail due to timeout or other errors.
 */
const fetchWithTimeoutRetry = async (
  url: string, // The URL to fetch
  opts: { timeoutMs: number; retryAttempts: number } = config.http // Options for timeout and retries, default from config
): Promise<Response> => {
  let attempt = 0; // Track the current attempt number
  const { timeoutMs, retryAttempts } = opts; // Destructure timeout and retry values from options

  while (true) {
    // Loop until a successful response or retries are exhausted
    attempt += 1; // Increment the attempt counter
    const controller = new AbortController(); // Create an AbortController to manage request timeout
    const timer = setTimeout(() => controller.abort(), timeoutMs); // Set a timer to abort the request after timeoutMs

    try {
      // Perform the fetch request with default headers and abort signal
      const response = await fetch(url, {
        headers: {
          ...defaultRequestHeaders, // Merge default headers
        },
        signal: controller.signal, // Attach abort signal for timeout
      } as Parameters<typeof fetch>[1]);
      clearTimeout(timer); // Clear the timeout once fetch completes

      // If response status is 429 (Too Many Requests) or 500 (Internal Server Error) and retries remain
      if (
        (response.status === 429 || response.status === 500) &&
        attempt <= retryAttempts
      ) {
        logger.warn(`HTTP ${response.status} received, retrying once`, {
          url,
          attempt,
        }); // Log warning about retry
        await new Promise((r) => setTimeout(r, 300)); // Wait 300ms before retrying
        continue; // Retry the request
      }

      return response; // Return the successful response
    } catch (error: unknown) {
      clearTimeout(timer); // Clear the timeout if an error occurs
      const isAbortError = (error as { name?: string })?.name === "AbortError"; // Check if error is due to abort (timeout)

      // If request was aborted due to timeout and retries remain
      if (isAbortError && attempt <= retryAttempts) {
        logger.warn("Request timed out, retrying once", { url, attempt }); // Log warning about timeout retry
        await new Promise((r) => setTimeout(r, 300)); // Wait 300ms before retrying
        continue; // Retry the request
      }

      throw error; // Throw error if not retryable or retries exhausted
    }
  }
};

export default fetchWithTimeoutRetry;
