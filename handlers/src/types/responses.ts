export type AddressLookupResponse = {
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  suburbName: string;
  stateElectoralDistrict: string;
  propertyId: number;
  principalAddressSiteOid: number;
  query: string;
};

export type ErrorResponse = {
  error: string;
};

export type AddressLookupResponses = AddressLookupResponse | ErrorResponse;
