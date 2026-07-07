"use client";

import React, { useState, useEffect } from 'react';

interface LocationState {
  loading: boolean;
  error: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}

export default function LocationDashboard() {
  const [loc, setLoc] = useState<LocationState>({
    loading: true,
    error: null,
    latitude: null,
    longitude: null,
    accuracy: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoc(prev => ({ ...prev, loading: false, error: "Geolocation is not supported by your browser." }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoc({
          loading: false,
          error: null,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (err) => {
        let msg = "Permission denied. Please allow location access in your browser settings.";
        if (err.code === 2) msg = "Location information is unavailable.";
        if (err.code === 3) msg = "The request to get user location timed out.";
        setLoc(prev => ({ ...prev, loading: false, error: msg }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <div className="w-full bg-white border border-neutral-100 rounded-xl p-6 md:p-8 shadow-sm">
      {loc.loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-8 h-8 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-neutral-500 tracking-wide">Retrieving secure coordinates...</p>
        </div>
      )}

      {loc.error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 text-center font-medium">
          {loc.error}
        </div>
      )}

      {!loc.loading && !loc.error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-b md:border-b-0 md:border-r border-neutral-100 pb-6 md:pb-0 md:pr-6">
            <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Latitude</span>
            <p className="text-3xl font-light text-neutral-900 mt-1 tabular-nums">{loc.latitude?.toFixed(6)}</p>
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Longitude</span>
            <p className="text-3xl font-light text-neutral-900 mt-1 tabular-nums">{loc.longitude?.toFixed(6)}</p>
          </div>
          <div className="md:col-span-2 pt-4 border-t border-neutral-100 flex flex-wrap gap-4 text-xs font-medium text-neutral-500">
            <div>
              Accuracy: <span className="text-neutral-900 font-semibold">{loc.accuracy?.toFixed(1)} meters</span>
            </div>
            <span>•</span>
            <div>
              Status: <span className="text-emerald-600 font-semibold">Securely Resolved</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}