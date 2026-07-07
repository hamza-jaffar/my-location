import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://my-location.degvora.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0, // Highest priority because it's your homepage/main tool
    },
    // If you add other pages later (like an /about or /privacy policy), add them here:
    // {
    //   url: 'https://my-location.degvora.com/privacy',
    //   lastModified: new Date(),
    //   changeFrequency: 'yearly',
    //   priority: 0.3,
    // },
  ];
}