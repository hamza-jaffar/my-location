import { IpGeoData } from "../types";

export function parseIpwho(raw: Record<string, unknown>): IpGeoData | null {
    if (raw.success === false) return null;
    const conn = (raw.connection ?? {}) as Record<string, unknown>;
    const tz = (raw.timezone ?? {}) as Record<string, unknown>;
    const sec = (raw.security ?? {}) as Record<string, unknown>;
    return {
        query: String(raw.ip ?? ""),
        country: String(raw.country ?? ""),
        countryCode: String(raw.country_code ?? ""),
        region: String(raw.region_code ?? ""),
        regionName: String(raw.region ?? ""),
        city: String(raw.city ?? ""),
        zip: String(raw.postal ?? ""),
        lat: Number(raw.latitude ?? 0),
        lon: Number(raw.longitude ?? 0),
        timezone: String(tz.id ?? ""),
        utcOffset: String(tz.utc ?? ""),
        isp: String(conn.isp ?? conn.org ?? ""),
        org: String(conn.org ?? ""),
        domain: String(conn.domain ?? ""),
        asn: conn.asn ? `AS${conn.asn}` : "",
        mobile: false,
        proxy: Boolean(sec.proxy ?? false),
        hosting: Boolean(sec.hosting ?? false),
    };
}

export function parseIpapi(raw: Record<string, unknown>): IpGeoData | null {
    if (raw.error) return null;
    // utc_offset from ipapi.co is "+0500" → normalise to "+05:00"
    const rawOffset = String(raw.utc_offset ?? "");
    const utcOffset = rawOffset.length === 5
        ? `${rawOffset.slice(0, 3)}:${rawOffset.slice(3)}`
        : rawOffset;
    // org field includes ASN prefix: "AS9541 Cyber Internet..." — split it out
    const orgFull = String(raw.org ?? "");
    const asnMatch = orgFull.match(/^(AS\d+)\s*/);
    const asn = asnMatch?.[1] ?? String(raw.asn ?? "");
    const org = asnMatch ? orgFull.slice(asnMatch[0].length) : orgFull;
    return {
        query: String(raw.ip ?? ""),
        country: String(raw.country_name ?? ""),
        countryCode: String(raw.country_code ?? raw.country ?? ""),
        region: String(raw.region_code ?? ""),
        regionName: String(raw.region ?? ""),
        city: String(raw.city ?? ""),
        zip: String(raw.postal ?? ""),
        lat: Number(raw.latitude ?? 0),
        lon: Number(raw.longitude ?? 0),
        timezone: String(raw.timezone ?? ""),
        utcOffset,
        isp: org,
        org,
        domain: "",
        asn,
        mobile: false,
        proxy: false,
        hosting: false,
    };
}