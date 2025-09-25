import {
  StateElectoralDistrictResponse,
  SuburbResponse,
  GeocodeResponse,
} from "../types/domain";
import { z } from "zod";

// Minimal schemas for only fields we use
const GeoFeatureSchema = z.object({
  id: z.number(),
  geometry: z.object({ coordinates: z.array(z.number()).min(2) }),
  properties: z.object({ address: z.string() }),
});
export const GeocodeSchema = z.object({
  features: z.array(GeoFeatureSchema),
});

const ElectoralFeatureSchema = z.object({
  properties: z.object({ districtname: z.string() }),
});
export const ElectoralSchema = z.object({
  features: z.array(ElectoralFeatureSchema),
});

const SuburbFeatureSchema = z.object({
  properties: z.object({ suburbname: z.string() }),
});
const SuburbSchema = z.object({
  features: z.array(SuburbFeatureSchema),
});

export const parseSuburbSchema = (data: unknown) => {
  try {
    return SuburbSchema.parse(data) as unknown as SuburbResponse;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error(`Suburb response validation error: ${error.message}`);
    }
    throw error;
  }
};

export const parseGeocodeSchema = (data: unknown) => {
  try {
    return GeocodeSchema.parse(data) as unknown as GeocodeResponse;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error(`Geocode response validation error: ${error.message}`);
    }
    throw error;
  }
};

export const parseElectoralSchema = (data: unknown) => {
  try {
    return ElectoralSchema.parse(
      data
    ) as unknown as StateElectoralDistrictResponse;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error(`Electoral response validation error: ${error.message}`);
    }
    throw error;
  }
};
