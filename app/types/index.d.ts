export interface GpsData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface IpGeoData {
  query: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  utcOffset: string;
  isp: string;
  org: string;
  domain: string;
  asn: string;
  mobile: boolean;
  proxy: boolean;
  hosting: boolean;
}

export interface State {
  gpsLoading: boolean;
  gpsError: string | null;
  gps: GpsData | null;
  ipLoading: boolean;
  ipError: string | null;
  ipGeo: IpGeoData | null;
  ipv4: string | null;
  ipv6: string | null;
  copied: string | null;
}
