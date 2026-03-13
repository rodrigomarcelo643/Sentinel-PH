// Types from src/services/geoapifyService.ts

export interface GeoapifyPlace {
  place_id: string;
  display_name: string;
  name: string;
  country: string;
  country_code: string;
  state: string;
  county?: string;
  city?: string;
  municipality?: string;
  district?: string;
  postcode?: string;
  lat: number;
  lon: number;
  formatted: string;
  address_line1: string;
  address_line2: string;
  category: string;
  result_type: string;
  rank: {
    importance: number;
    confidence: number;
  };
  bbox: {
    lat1: number;
    lon1: number;
    lat2: number;
    lon2: number;
  };
}

export interface PhilippineRegion {
  name: string;
  fullName: string;
  code: string;
  lat: number;
  lon: number;
}

export interface PhilippineMunicipality {
  name: string;
  region: string;
  province?: string;
  lat: number;
  lon: number;
  type: 'city' | 'municipality' | 'district' | 'component_city' | 'independent_component_city' | 'highly_urbanized_city';
  classification?: 'chartered_city' | 'component_city' | 'independent_component_city' | 'highly_urbanized_city';
  income_class?: '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th';
  population?: number;
  districts?: PhilippineDistrict[];
}

export interface PhilippineDistrict {
  name: string;
  municipality: string;
  region: string;
  type: 'district' | 'poblacion' | 'urban_district' | 'rural_district';
  lat: number;
  lon: number;
  barangays?: PhilippineBarangay[];
}

export interface PhilippineBarangay {
  name: string;
  district?: string;
  municipality: string;
  region: string;
  type: 'urban' | 'rural' | 'poblacion';
  lat: number;
  lon: number;
  postal_code?: string;
  address_line?: string;
}