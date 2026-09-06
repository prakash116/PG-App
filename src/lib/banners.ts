/**
 * Hero slides.
 *
 * THIS CONTENT WILL COME FROM THE BACKEND. The shape below is the API
 * contract the app expects from GET /v1/banners once it exists — camelCase,
 * hex colour pairs, nullable optionals — so the switch is a fetch, not a
 * rewrite. Until then `fixtureBanners` stands in behind USE_FIXTURES, the
 * same way the catalogue does. Do not add slide copy anywhere but here.
 */
export type BannerTexture = 'dots' | 'stripes' | 'rings';

export interface BannerSlide {
  id: string;
  /** Short — two lines at most on a phone. */
  title: string;
  subtitle: string | null;
  /** A photo or promo art, shown as a tilted card on the right. */
  imageUrl: string | null;
  /** Top-left to bottom-right, as hex. */
  colors: [string, string];
  texture: BannerTexture;
  /** Where a tap goes once the app has deep links. Unused for now. */
  deepLink: string | null;
  sortOrder: number;
}

const photo = (id: string) => 'https://images.unsplash.com/' + id + '?q=80&w=800&auto=format&fit=crop';

export const fixtureBanners: BannerSlide[] = [
  {
    id: 'home',
    title: 'Find a PG that feels like home',
    subtitle: 'Verified stays near your college or office',
    imageUrl: photo('photo-1522708323590-d24dbb6b0267'),
    colors: ['#FFA648', '#F08420'],
    texture: 'dots',
    deepLink: null,
    sortOrder: 1,
  },
  {
    id: 'verified',
    title: 'Verified PGs. Zero guesswork.',
    subtitle: 'Every listing checked by our team',
    imageUrl: photo('photo-1493809842364-78817add7ffb'),
    colors: ['#FF9933', '#CC6A14'],
    texture: 'stripes',
    deepLink: null,
    sortOrder: 2,
  },
  {
    id: 'budget',
    title: 'Your budget. Your room.',
    subtitle: 'Filters that match real life',
    imageUrl: photo('photo-1560448204-e02f11c3d0e2'),
    colors: ['#F08420', '#A3520D'],
    texture: 'rings',
    deepLink: null,
    sortOrder: 3,
  },
];

/** What the header floats over while banners load or fail: brand colour, no copy. */
export const fallbackBanners: BannerSlide[] = [
  {
    id: 'fallback',
    title: '',
    subtitle: null,
    imageUrl: null,
    colors: ['#FFA648', '#F08420'],
    texture: 'dots',
    deepLink: null,
    sortOrder: 0,
  },
];
