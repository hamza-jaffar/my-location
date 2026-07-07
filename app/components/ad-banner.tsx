"use client";

import React, { useEffect } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
}

export default function AdBanner({ slot, format = 'auto' }: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 overflow-hidden flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-2 block">Advertisement</span>
      <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-2 min-h-25 w-full flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="pub-7650628729482645"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}