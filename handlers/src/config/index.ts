const config = {
  stage: process.env.STAGE ?? "dev",
  logLevel: (process.env.LOG_LEVEL as "DEBUG" | "INFO" | "WARN" | "ERROR") ?? (process.env.STAGE === "prod" ? "INFO" : "DEBUG"),
  cacheMaxAge: 300, // Cache duration in seconds (5 minutes)
  // HTTP client defaults
  http: {
    timeoutMs: Number(process.env.HTTP_TIMEOUT_MS ?? 8000),
    retryAttempts: Number(process.env.HTTP_RETRY_ATTEMPTS ?? 1), // single retry by default
  },
  apis: {
    nsw: {
      geocoding: {
        baseUrl: "https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Geocoded_Addressing_Theme/FeatureServer/1/query",
      },
      boundariesStateElectoralDistrict: {
        baseUrl: "https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Administrative_Boundaries_Theme/FeatureServer/4/query",
      },
      boundariesSuburb: {
        baseUrl: "https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Administrative_Boundaries_Theme/FeatureServer/2/query",
      },
    },
  },
};

export default config;
