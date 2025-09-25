import { LocationInfo } from "./domain";

export type AddressLookupResponse = {
  query: string;
} & LocationInfo;

export type ErrorResponse = {
  error: string;
};

export type AddressLookupResponses = AddressLookupResponse | ErrorResponse;
