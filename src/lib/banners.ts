/**
 * Hero slides: a solid brand colour with a quiet texture, nothing else. No
 * copy, no button, no photo — the banner is a brand surface the header
 * floats over, not a message. Three textures give the swipe something to
 * reveal without any of them competing with the cards below.
 */
export type BannerTexture = 'dots' | 'stripes' | 'rings';

export interface BannerSlide {
  id: string;
  texture: BannerTexture;
  /** Top-left to bottom-right. Kept inside the saffron family so the three
   *  read as one brand, not three moods. */
  colors: [string, string];
}

export const bannerSlides: BannerSlide[] = [
  { id: 'dots', texture: 'dots', colors: ['#FFA648', '#F08420'] },
  { id: 'stripes', texture: 'stripes', colors: ['#FF9933', '#CC6A14'] },
  { id: 'rings', texture: 'rings', colors: ['#F08420', '#A3520D'] },
];
