export interface GeocodeResponse {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id: number;
    geometry: {
      type: 'Point';
      coordinates: [number, number, number]; // [longitude, latitude, elevation]
    };
    properties: {
      rid: number;
      address: string;
      housenumber?: string;
      gurasid: number;
      // ... other properties
    };
  }>;
}

export interface AdministrativeBoundaryResponse {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id: number;
    geometry: null;
    properties: {
      rid: number;
      districtname: string;
      urbanity: string;
      // ... other properties
    };
  }>;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  address: string;
  suburbName: string;
  stateElectoralDistrict: string;
  propertyId: number;
}