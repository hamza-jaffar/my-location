"use client";

import React, { useState, useEffect, useCallback } from "react";
import NetworkIcon from "./Icons/network-icon";
import GlobeIcon from "./Icons/globe-icon";
import ClockIcon from "./Icons/clock-icon";
import ShieldIcon from "./Icons/shield-icon";
import Badge from "./badge";
import PinIcon from "./Icons/pin-icon";
import { IpGeoData, State } from "../types";
import { parseIpapi, parseIpwho } from "../lib/utils";
import { SectionCard } from "./section-card";
import DataRow from "./data-row";
import Skeleton from "./skeleton";

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

  // ── GPS Tracking & IP Synchronization ──
  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, gpsLoading: false, gpsError: "Geolocation not supported by your browser." }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState((s) => {
          // Explicitly sync the ipGeo coordinates to match the live hardware coordinates
          const updatedIpGeo = s.ipGeo
            ? { ...s.ipGeo, lat: pos.coords.latitude, lon: pos.coords.longitude }
            : null;

          return {
            ...s,
            gpsLoading: false,
            ipGeo: updatedIpGeo,
            gps: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              altitude: pos.coords.altitude,
              accuracy: pos.coords.accuracy,
              altitudeAccuracy: pos.coords.altitudeAccuracy,
              heading: pos.coords.heading,
              speed: pos.coords.speed,
            },
          };
        });
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

  // ── Network IP Metadata Fetching ──
  useEffect(() => {
    const fetchIpData = async () => {
      try {
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

        // ── Try primary: ipwho.is ──
        let geo: IpGeoData | null = null;
        if (geoRes.status === "fulfilled" && geoRes.value.ok) {
          try {
            const raw = await geoRes.value.json() as Record<string, unknown>;
            geo = parseIpwho(raw);
          } catch { /* malformed JSON – fall through */ }
        }

        // ── Fallback: ipapi.co ──
        if (!geo) {
          try {
            const res = await fetch("https://ipapi.co/json/");
            if (res.ok) {
              const raw = await res.json() as Record<string, unknown>;
              geo = parseIpapi(raw);
            }
          } catch { /* fallback also failed */ }
        }

        if (geo) {
          setState((s) => {
            // If GPS hardware resolved faster than the IP mesh networks,
            // make sure we preserve the exact physical location coordinates.
            const verifiedGeo = s.gps
              ? { ...geo!, lat: s.gps.latitude, lon: s.gps.longitude }
              : geo;

            return {
              ...s,
              ipLoading: false,
              ipGeo: verifiedGeo,
              ipError: null,
              ipv4,
              ipv6,
            };
          });
        } else {
          setState((s) => ({ ...s, ipLoading: false, ipError: "Could not resolve IP geolocation.", ipv4, ipv6 }));
        }
      } catch {
        setState((s) => ({ ...s, ipLoading: false, ipError: "Network error fetching IP data." }));
      }
    };
    fetchIpData();
  }, []);

  // ── Real-time clock ──
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Copy Functionality ──
  const copy = useCallback((key: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setState((s) => ({ ...s, copied: key }));
      setTimeout(() => setState((s) => ({ ...s, copied: null })), 1800);
    });
  }, []);

  const { gps, gpsLoading, gpsError, ipGeo, ipLoading, ipError, ipv4, ipv6, copied } = state;

  const mapsUrl = gps
    ? `https://www.google.com/maps?q=${gps.latitude.toFixed(6)},${gps.longitude.toFixed(6)}`
    : null;

  const localTime = ipGeo?.timezone
    ? now.toLocaleString("en-US", {
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
    <div className="w-full space-y-4 md:space-y-5 px-2 sm:px-0">

      {/* ── Hero Coordinate Bar ─────────────────────────────────────────── */}
      <div className="w-full bg-neutral-950 text-white rounded-2xl p-5 sm:p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-violet-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
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
              {/* Stack coordinates vertically on extra small screens to prevent text clipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                <div className="pb-3 sm:pb-0 border-b border-white/5 sm:border-0">
                  <p className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase mb-1">Latitude</p>
                  <p className="text-2xl xs:text-3xl md:text-4xl font-light tabular-nums tracking-tight break-all">
                    {gps.latitude.toFixed(6)}°
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase mb-1">Longitude</p>
                  <p className="text-2xl xs:text-3xl md:text-4xl font-light tabular-nums tracking-tight break-all">
                    {gps.longitude.toFixed(6)}°
                  </p>
                </div>
              </div>

              {/* Adjust layout wraps and layout parameters across viewport breaks */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 mt-5 pt-5 border-t border-white/10">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-400 w-full sm:w-auto">
                  <div>
                    Accuracy <span className="text-white font-semibold">±{gps.accuracy.toFixed(0)} m</span>
                  </div>
                  {gps.altitude !== null && (
                    <div>
                      Altitude <span className="text-white font-semibold">{gps.altitude.toFixed(1)} m</span>
                    </div>
                  )}
                  {gps.speed !== null && gps.speed > 0 && (
                    <div>
                      Speed <span className="text-white font-semibold">{(gps.speed * 3.6).toFixed(1)} km/h</span>
                    </div>
                  )}
                </div>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center sm:justify-start gap-1.5 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors pt-2 sm:pt-0 border-t border-white/5 sm:border-0"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">

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
                  : null}
              />
              <DataRow label="AS Number" value={ipGeo?.asn} mono />
              {ipError && <p className="text-xs text-red-500 py-2">{ipError}</p>}
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

        {/* Security & Connection */}
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

      {/* ── GPS Hardware Details ────────────────────────────────────────── */}
      {!gpsLoading && gps && (
        <SectionCard icon={<PinIcon />} title="GPS Hardware Details" accent="neutral">
          {/* Changed grid layout parameters and removed conflicting row/column border dividers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 p-1">
            {[
              { label: "Latitude", value: `${gps.latitude.toFixed(7)}°` },
              { label: "Longitude", value: `${gps.longitude.toFixed(7)}°` },
              { label: "Accuracy", value: `±${gps.accuracy.toFixed(1)} m` },
              { label: "Altitude", value: gps.altitude !== null ? `${gps.altitude.toFixed(1)} m` : null },
              { label: "Alt. Accuracy", value: gps.altitudeAccuracy !== null ? `±${gps.altitudeAccuracy.toFixed(1)} m` : null },
              { label: "Heading", value: gps.heading !== null ? `${gps.heading.toFixed(1)}°` : null },
              { label: "Speed", value: gps.speed !== null && gps.speed > 0 ? `${(gps.speed * 3.6).toFixed(2)} km/h` : null },
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
              <div key={item.label} className="flex flex-col gap-0.5 pb-2 border-b border-neutral-100 sm:border-b-0">
                <span className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">{item.label}</span>
                <span className="text-sm font-medium text-neutral-800 font-mono tabular-nums break-all">{item.value}</span>
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
              ipGeo?.org && ipGeo.org !== ipGeo.isp && `Organisation: ${ipGeo.org}`,
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
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-sm font-medium text-neutral-600 transition-colors shadow-sm active:bg-neutral-100"
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