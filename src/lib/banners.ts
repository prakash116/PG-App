/**
 * Hero slides, mirroring the website's HeroCarousel copy so the two surfaces
 * say the same thing. There is no banners endpoint; when one exists this
 * becomes a fetch and the carousel does not change.
 */
export type BannerAction = 'browse' | 'verified' | 'search';

export interface BannerSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  action: BannerAction;
}

const photo = (id: string) => 'https://images.unsplash.com/' + id + '?q=80&w=1400&auto=format&fit=crop';

export const bannerSlides: BannerSlide[] = [
  {
    id: 'home',
    eyebrow: 'Trusted by 10,000+ students & professionals',
    title: 'Find a PG that actually feels like home.',
    subtitle: 'Verified, affordable and comfortable PGs near your college or workplace.',
    image: photo('photo-1522708323590-d24dbb6b0267'),
    cta: 'Find your PG',
    action: 'browse',
  },
  {
    id: 'verified',
    eyebrow: 'Every listing checked by our team',
    title: 'Verified PGs. Zero guesswork.',
    subtitle: 'Trusted properties with verified details, photos and transparent pricing.',
    image: photo('photo-1493809842364-78817add7ffb'),
    cta: 'Explore verified PGs',
    action: 'verified',
  },
  {
    id: 'search',
    eyebrow: 'Smart search built for real life',
    title: 'Your budget. Your location. Your room.',
    subtitle: 'Tell us what you need and find PGs that fit your life and your budget.',
    image: photo('photo-1560448204-e02f11c3d0e2'),
    cta: 'Search PGs',
    action: 'search',
  },
];
