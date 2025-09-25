export type GeocodeResponse = {
    type: "FeatureCollection";
    features: Array<{
        type: "Feature";
        id: number;
        geometry: {
            type: "Point";
            coordinates: [number, number]; // [longitude, latitude]
        };
        properties: {
            rid: number;
            createdate: number;
            gurasid: number;
            principaladdresssiteoid: number;
            addressstringoid: number;
            addresspointtype: number;
            addresspointuncertainty: number | null;
            containment: number;
            startdate: number;
            enddate: number;
            lastupdate: number;
            msoid: number;
            centroidid: number | null;
            shapeuuid: string;
            changetype: string;
            processstate: number | null;
            urbanity: string;
            address: string;
            housenumber: string;
        };
    }>;
};

export type AdministrativeBoundaryResponse = {
    type: "FeatureCollection";
    features: Array<{
        type: "Feature";
        id: number;
        geometry: null;
        properties: {
            rid: number;
            cadid: number;
            createdate: number;
            modifieddate: number;
            districtname: string;
            startdate: number;
            enddate: number;
            lastupdate: number;
            msoid: number;
            centroidid: number | null;
            shapeuuid: string;
            changetype: string;
            processstate: number | null;
            urbanity: string;
            Shape__Length: number;
            Shape__Area: number;
        };
    }>;
};

export type LocationInfo = {
  latitude: number;
  longitude: number;
  address: string;
  suburbName: string;
  stateElectoralDistrict: string;
};
