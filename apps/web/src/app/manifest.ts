import type { MetadataRoute } from 'next';
import { SITE } from '@/shared/config';

/** Web app manifest: name, colors and icons for "Add to Home Screen". */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: SITE.backgroundColor,
    theme_color: SITE.themeColor,
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
