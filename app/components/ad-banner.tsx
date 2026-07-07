"use client";

import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdBanner({ slot, format = 'auto' }: AdBannerProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 overflow-hidden flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-2 block">Advertisement</span>
      <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-2 w-full" style={{ minHeight: '100px' }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minWidth: '250px', minHeight: '100px' }}
          data-ad-client="ca-pub-7650628729482645"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}