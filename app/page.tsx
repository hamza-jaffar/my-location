import { Metadata } from 'next';
import AdBanner from './components/ad-banner';
import LocationDashboard from './components/location-dashboard';
// Complete SEO Meta Configuration
export const metadata: Metadata = {
  title: "What is My Location? — Current GPS Coordinates & Address",
  description: "Find your current location, exact GPS coordinates, and map view instantly. A fast, secure geolocational tool by Degvora.",
  keywords: ["what is my location", "my current location", "find my coordinates", "current GPS coordinates"],
  openGraph: {
    title: "What is My Location? — Current GPS Coordinates",
    description: "Find your current location and exact coordinates instantly.",
    url: "https://my-location.degvora.com",
    siteName: "Degvora Tools",
    type: "website",
  },
};

// Structured Schema Markup for Search Crawlers
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "My Location Tool",
  "url": "https://my-location.degvora.com",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript and GPS/Location Access.",
  "description": "An instant premium utility tool to find your exact location, coordinates, and address."
};

export default function HomePage() {
  return (
    <>
      {/* Search Engine Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 flex flex-col min-h-screen">
          
          {/* Main Layout Header */}
          <header className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
              Degvora Web Utilities
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-normal text-neutral-950 tracking-tight mt-3 mb-4">
              What is my location?
            </h1>
            <p className="max-w-md mx-auto text-neutral-500 text-sm md:text-base leading-relaxed">
              Instantly resolve your precise geographical hardware coordinates, address configurations, and mapping telemetry.
            </p>
          </header>

          {/* Top Ad Banner Slot */}
          <AdBanner slot="6844420573" /> {/* 👈 Replace with real top banner slot ID */}

          {/* Dynamic Geo Core */}
          <section className="grow w-full my-4">
            <LocationDashboard />
          </section>

          {/* SEO Optimized Context Content Section */}
          <article className="prose prose-neutral max-w-none mt-12 pt-12 border-t border-neutral-200/60">
            <h2 className="text-xl font-serif text-neutral-950 font-normal mb-4">About Geolocation Data Privacy</h2>
            <p className="text-xs md:text-sm text-neutral-500 leading-relaxed">
              This utility resolves your geographic position client-side utilizing directly integrated native web mapping APIs. 
              Your precision coordinates are never processed, transferred, or cached onto our remote infrastructure, ensuring complete transactional confidentiality.
            </p>
          </article>

          {/* Bottom Ad Banner Slot */}
          <AdBanner slot="1592093898" /> {/* 👈 Replace with real bottom banner slot ID */}

          {/* Elegant Footer */}
          <footer className="mt-auto pt-12 pb-6 text-center border-t border-neutral-100">
            <p className="text-xs font-medium tracking-wide text-neutral-400">
              &copy; {new Date().getFullYear()} Degvora. All rights reserved.
            </p>
          </footer>

        </div>
      </main>
    </>
  );
}