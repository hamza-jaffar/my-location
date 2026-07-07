"use client";

import React, { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GpsData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

interface IpGeoData {
  query: string;       // IP used for lookup
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

interface State {
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

// ─── Helper Components ────────────────────────────────────────────────────────

function Skeleton({ w = "w-full", h = "h-5" }: { w?: string; h?: string }) {
  return (
    <div
      className={`${w} ${h} bg-neutral-100 rounded animate-pulse`}
    />
  );
}

function Badge({ label, color }: { label: string; color: "green" | "yellow" | "red" | "blue" | "neutral" }) {
  const colors = {
    green:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    yellow:  "bg-amber-50 text-amber-700 border-amber-200",
    red:     "bg-red-50 text-red-600 border-red-200",
    blue:    "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colors[color]}`}>
      {label}
    </span>
  );
}

function DataRow({
  label,
  value,
  mono = false,
  onCopy,
  copied,
  badge,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  badge?: React.ReactNode;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-neutral-50 last:border-0 group">
      <span className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase min-w-[120px] pt-0.5 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
        {badge}
        <span
          className={`text-sm text-neutral-800 font-medium break-words text-right leading-snug ${mono ? "font-mono" : ""}`}
          title={value}
        >
          {value}
        </span>
        {onCopy && (
          <button
            onClick={onCopy}
            aria-label={`Copy ${label}`}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-neutral-100"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
  accent = "neutral",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accent?: "blue" | "violet" | "emerald" | "amber" | "neutral";
}) {
  const accents = {
    blue:    "from-blue-500/10 to-transparent border-blue-100",
    violet:  "from-violet-500/10 to-transparent border-violet-100",
    emerald: "from-emerald-500/10 to-transparent border-emerald-100",
    amber:   "from-amber-500/10 to-transparent border-amber-100",
    neutral: "from-neutral-100 to-transparent border-neutral-100",
  };
  const iconColors = {
    blue:    "text-blue-600",
    violet:  "text-violet-600",
    emerald: "text-emerald-600",
    amber:   "text-amber-600",
    neutral: "text-neutral-500",
  };
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${accents[accent]}`}>
      <div className={`bg-gradient-to-b ${accents[accent]} px-5 py-4 border-b flex items-center gap-3`}>
        <span className={`${iconColors[accent]}`}>{icon}</span>
        <h3 className="text-sm font-semibold text-neutral-800 tracking-wide">{title}</h3>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
  </svg>
);
const NetworkIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <rect x="2" y="2" width="6" height="6" rx="1" /><rect x="16" y="2" width="6" height="6" rx="1" />
    <rect x="9" y="16" width="6" height="6" rx="1" />
    <path d="M5 8v3a1 1 0 001 1h12a1 1 0 001-1V8M12 12v4" />
  </svg>
);
const PinIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);
const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v5c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V6l7-4z" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LocationDashboard() {
  const [state, setState] = useState<State>({
    gpsLoading: true,
    gpsError: null,
    gps: null,
    ipLoading: true,
    ipError: null,
    ipGeo: null,
    ipv4: null,
    ipv6: null,
    copied: null,
  });

  // ── GPS ──
  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, gpsLoading: false, gpsError: "Geolocation not supported by your browser." }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState((s) => ({
          ...s,
          gpsLoading: false,
          gps: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
            accuracy: pos.coords.accuracy,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
          },
        }));
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: "Location access denied. Enable it in your browser settings.",
          2: "Location unavailable. Check your device settings.",
          3: "Location request timed out. Try again.",
        };
        setState((s) => ({ ...s, gpsLoading: false, gpsError: msgs[err.code] ?? "Unknown location error." }));
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

  // ── IP Geolocation ──
  useEffect(() => {
    const fetchIpData = async () => {
      try {
        // Fetch IPv4, IPv6, and geo concurrently.
        // ipwho.is is HTTPS-native and free with no API key required.
        const [ipv4Res, ipv6Res, geoRes] = await Promise.allSettled([
          fetch("https://api4.ipify.org?format=json"),
          fetch("https://api6.ipify.org?format=json"),
          fetch("https://ipwho.is/"),
        ]);

        let ipv4: string | null = null;
        let ipv6: string | null = null;

        if (ipv4Res.status === "fulfilled" && ipv4Res.value.ok) {
          const d = await ipv4Res.value.json();
          ipv4 = d.ip ?? null;
        }
        if (ipv6Res.status === "fulfilled" && ipv6Res.value.ok) {
          const d = await ipv6Res.value.json();
          if (d.ip && d.ip.includes(":")) ipv6 = d.ip;
        }

        if (geoRes.status === "fulfilled" && geoRes.value.ok) {
          // ipwho.is response shape (nested connection + timezone objects)
          const raw = await geoRes.value.json();
          if (raw.success === false) {
            setState((s) => ({ ...s, ipLoading: false, ipError: raw.message ?? "IP lookup failed.", ipv4, ipv6 }));
            return;
          }
          const geo: IpGeoData = {
            query:       raw.ip,
            country:     raw.country        ?? "",
            countryCode: raw.country_code   ?? "",
            region:      raw.region_code    ?? "",
            regionName:  raw.region         ?? "",
            city:        raw.city           ?? "",
            zip:         raw.postal         ?? "",
            lat:         raw.latitude       ?? 0,
            lon:         raw.longitude      ?? 0,
            timezone:    raw.timezone?.id   ?? "",
            utcOffset:   raw.timezone?.utc  ?? "",
            isp:         raw.connection?.isp  ?? raw.connection?.org ?? "",
            org:         raw.connection?.org  ?? "",
            domain:      raw.connection?.domain ?? "",
            asn:         raw.connection?.asn  ? `AS${raw.connection.asn}` : "",
            mobile:      false,
            proxy:       raw.security?.proxy  ?? false,
            hosting:     raw.security?.hosting ?? false,
          };
          setState((s) => ({ ...s, ipLoading: false, ipGeo: geo, ipError: null, ipv4, ipv6 }));
        } else {
          setState((s) => ({ ...s, ipLoading: false, ipError: "Failed to fetch IP data.", ipv4, ipv6 }));
        }
      } catch {
        setState((s) => ({ ...s, ipLoading: false, ipError: "Network error fetching IP data." }));
      }
    };
    fetchIpData();
  }, []);

  // ── Copy ──
  const copy = useCallback((key: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setState((s) => ({ ...s, copied: key }));
      setTimeout(() => setState((s) => ({ ...s, copied: null })), 1800);
    });
  }, []);

  const { gps, gpsLoading, gpsError, ipGeo, ipLoading, ipError, ipv4, ipv6, copied } = state;

  // Build Google Maps link
  const mapsUrl =
    gps ? `https://www.google.com/maps?q=${gps.latitude.toFixed(6)},${gps.longitude.toFixed(6)}` : null;

  // Local time in detected timezone
  const localTime = ipGeo?.timezone
    ? new Date().toLocaleString("en-US", {
        timeZone: ipGeo.timezone,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <div className="w-full space-y-5">

      {/* ── Hero Coordinate Bar ─────────────────────────────────────────── */}
      <div className="w-full bg-neutral-950 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-violet-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-neutral-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
              Live Location Signal
            </span>
          </div>

          {gpsLoading ? (
            <div className="space-y-3">
              <Skeleton h="h-10" w="w-2/3" />
              <Skeleton h="h-6" w="w-1/2" />
            </div>
          ) : gpsError ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">
              {gpsError}
            </div>
          ) : gps ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div>
                  <p className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase mb-1">Latitude</p>
                  <p className="text-3xl md:text-4xl font-light tabular-nums tracking-tight">
                    {gps.latitude.toFixed(6)}°
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase mb-1">Longitude</p>
                  <p className="text-3xl md:text-4xl font-light tabular-nums tracking-tight">
                    {gps.longitude.toFixed(6)}°
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-white/10">
                <div className="text-xs text-neutral-400">
                  Accuracy <span className="text-white font-semibold">±{gps.accuracy.toFixed(0)} m</span>
                </div>
                {gps.altitude !== null && (
                  <div className="text-xs text-neutral-400">
                    Altitude <span className="text-white font-semibold">{gps.altitude.toFixed(1)} m</span>
                  </div>
                )}
                {gps.speed !== null && gps.speed > 0 && (
                  <div className="text-xs text-neutral-400">
                    Speed <span className="text-white font-semibold">{(gps.speed * 3.6).toFixed(1)} km/h</span>
                  </div>
                )}
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Open in Maps
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* ── Cards Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Network / IP */}
        <SectionCard icon={<NetworkIcon />} title="Network & IP Address" accent="blue">
          {ipLoading ? (
            <div className="space-y-3 py-3">
              <Skeleton /><Skeleton w="w-4/5" /><Skeleton w="w-3/5" />
            </div>
          ) : (
            <>
              <DataRow
                label="IPv4"
                value={ipv4 ?? ipGeo?.query}
                mono
                onCopy={() => copy("ipv4", ipv4 ?? ipGeo?.query ?? "")}
                copied={copied === "ipv4"}
              />
              <DataRow
                label="IPv6"
                value={ipv6 ?? "Not detected"}
                mono
                onCopy={ipv6 ? () => copy("ipv6", ipv6) : undefined}
                copied={copied === "ipv6"}
              />
              <DataRow label="ISP" value={ipGeo?.isp} />
              <DataRow
                label="Organisation"
                value={ipGeo
                  ? (ipGeo.org && ipGeo.org !== ipGeo.isp ? ipGeo.org : ipGeo.domain || null)
                  : null
                }
              />
              <DataRow label="AS Number" value={ipGeo?.asn} mono />
              {ipError && (
                <p className="text-xs text-red-500 py-2">{ipError}</p>
              )}
            </>
          )}
        </SectionCard>

        {/* Physical Location */}
        <SectionCard icon={<GlobeIcon />} title="Physical Location" accent="emerald">
          {ipLoading ? (
            <div className="space-y-3 py-3">
              <Skeleton /><Skeleton w="w-4/5" /><Skeleton w="w-3/5" />
            </div>
          ) : (
            <>
              <DataRow label="Country" value={ipGeo ? `${ipGeo.country} (${ipGeo.countryCode})` : null} />
              <DataRow label="State / Region" value={ipGeo?.regionName} />
              <DataRow label="City" value={ipGeo?.city} />
              <DataRow label="Postal Code" value={ipGeo?.zip || "N/A"} mono />
              <DataRow
                label="IP Coordinates"
                value={ipGeo ? `${ipGeo.lat.toFixed(4)}, ${ipGeo.lon.toFixed(4)}` : null}
                mono
              />
            </>
          )}
        </SectionCard>

        {/* Timezone & Time */}
        <SectionCard icon={<ClockIcon />} title="Timezone & Local Time" accent="violet">
          {ipLoading ? (
            <div className="space-y-3 py-3">
              <Skeleton /><Skeleton w="w-4/5" />
            </div>
          ) : (
            <>
              <DataRow label="Timezone" value={ipGeo?.timezone} mono />
              <DataRow label="Local Time" value={localTime} mono />
              <DataRow label="UTC Offset" value={ipGeo?.utcOffset ?? null} mono />
              <DataRow label="Region Code" value={ipGeo?.region} mono />
            </>
          )}
        </SectionCard>

        {/* Security & Connection Flags */}
        <SectionCard icon={<ShieldIcon />} title="Connection & Security" accent="amber">
          {ipLoading ? (
            <div className="space-y-3 py-3">
              <Skeleton /><Skeleton w="w-4/5" /><Skeleton w="w-3/5" />
            </div>
          ) : (
            <>
              <DataRow
                label="Proxy / VPN"
                value={ipGeo ? (ipGeo.proxy ? "Detected" : "Not Detected") : null}
                badge={ipGeo ? <Badge label={ipGeo.proxy ? "Active" : "Clean"} color={ipGeo.proxy ? "red" : "green"} /> : undefined}
              />
              <DataRow
                label="Mobile Network"
                value={ipGeo ? (ipGeo.mobile ? "Yes" : "No") : null}
                badge={ipGeo ? <Badge label={ipGeo.mobile ? "Mobile" : "Broadband"} color={ipGeo.mobile ? "blue" : "neutral"} /> : undefined}
              />
              <DataRow
                label="Hosting / DC"
                value={ipGeo ? (ipGeo.hosting ? "Yes — Datacenter IP" : "No — Residential") : null}
                badge={ipGeo ? <Badge label={ipGeo.hosting ? "DC" : "Residential"} color={ipGeo.hosting ? "yellow" : "green"} /> : undefined}
              />
              <DataRow
                label="GPS Permission"
                value={gpsLoading ? "Checking…" : gpsError ? "Denied" : "Granted"}
                badge={
                  <Badge
                    label={gpsLoading ? "Pending" : gpsError ? "Denied" : "Granted"}
                    color={gpsLoading ? "neutral" : gpsError ? "red" : "green"}
                  />
                }
              />
            </>
          )}
        </SectionCard>
      </div>

      {/* ── GPS Detail Strip ────────────────────────────────────────────── */}
      {!gpsLoading && gps && (
        <SectionCard icon={<PinIcon />} title="GPS Hardware Details" accent="neutral">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-neutral-50">
            {[
              { label: "Latitude",     value: `${gps.latitude.toFixed(7)}°` },
              { label: "Longitude",    value: `${gps.longitude.toFixed(7)}°` },
              { label: "Accuracy",     value: `±${gps.accuracy.toFixed(1)} m` },
              { label: "Altitude",     value: gps.altitude !== null ? `${gps.altitude.toFixed(1)} m` : null },
              { label: "Alt. Accuracy",value: gps.altitudeAccuracy !== null ? `±${gps.altitudeAccuracy.toFixed(1)} m` : null },
              { label: "Heading",      value: gps.heading !== null ? `${gps.heading.toFixed(1)}°` : null },
              { label: "Speed",        value: gps.speed !== null && gps.speed > 0 ? `${(gps.speed * 3.6).toFixed(2)} km/h` : null },
              {
                label: "DMS Lat",
                value: (() => {
                  const d = Math.abs(gps.latitude);
                  const deg = Math.floor(d);
                  const min = Math.floor((d - deg) * 60);
                  const sec = ((d - deg - min / 60) * 3600).toFixed(2);
                  return `${deg}° ${min}' ${sec}" ${gps.latitude >= 0 ? "N" : "S"}`;
                })(),
              },
              {
                label: "DMS Lon",
                value: (() => {
                  const d = Math.abs(gps.longitude);
                  const deg = Math.floor(d);
                  const min = Math.floor((d - deg) * 60);
                  const sec = ((d - deg - min / 60) * 3600).toFixed(2);
                  return `${deg}° ${min}' ${sec}" ${gps.longitude >= 0 ? "E" : "W"}`;
                })(),
              },
            ].filter((item) => item.value !== null).map((item) => (
              <div key={item.label} className="p-3 flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">{item.label}</span>
                <span className="text-sm font-medium text-neutral-800 font-mono tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Copy All Button ─────────────────────────────────────────────── */}
      {(!gpsLoading || !ipLoading) && (
        <button
          onClick={() => {
            const lines = [
              ipv4 && `IPv4: ${ipv4}`,
              ipv6 && `IPv6: ${ipv6}`,
              ipGeo?.isp && `ISP: ${ipGeo.isp}`,
              ipGeo?.org && `Organisation: ${ipGeo.org}`,
              ipGeo?.asn && `AS: ${ipGeo.asn}`,
              ipGeo?.country && `Country: ${ipGeo.country} (${ipGeo.countryCode})`,
              ipGeo?.regionName && `State: ${ipGeo.regionName}`,
              ipGeo?.city && `City: ${ipGeo.city}`,
              ipGeo?.zip && `Postal Code: ${ipGeo.zip}`,
              ipGeo?.timezone && `Timezone: ${ipGeo.timezone}`,
              gps && `GPS Latitude: ${gps.latitude.toFixed(7)}`,
              gps && `GPS Longitude: ${gps.longitude.toFixed(7)}`,
              gps && `GPS Accuracy: ±${gps.accuracy.toFixed(1)} m`,
            ].filter(Boolean).join("\n");
            copy("all", lines);
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-sm font-medium text-neutral-600 transition-colors shadow-sm"
        >
          {copied === "all" ? (
            <>
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied to Clipboard!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy All Location Data
            </>
          )}
        </button>
      )}
    </div>
  );
}