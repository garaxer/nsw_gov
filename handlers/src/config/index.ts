const config = {
  stage: process.env.STAGE ?? "dev",
  apis: {
    nsw: {
      geocoding: {
        baseUrl: "https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Geocoded_Addressing_Theme/FeatureServer/1/query",
      },
      boundaries: {
        baseUrl: "https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Administrative_Boundaries_Theme/FeatureServer/4/query",
      },
    },
  },
};

export default config;
