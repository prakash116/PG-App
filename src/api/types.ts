/**
 * The API contract, mirrored by hand for now.
 *
 * These shapes come from PG-Backend's Prisma schema and its Swagger models.
 * Once the backend ships Milestone 0, this file is replaced by types generated
 * from /api/docs-json — which is the whole reason every field here matches the
 * server's spelling exactly rather than being renamed to something nicer.
 */

export type UserRole = 'SUPER_ADMIN' | 'PG_OWNER' | 'USER';
export type UserType = 'STUDENT' | 'TOURIST' | 'WORKING_PROFESSIONAL' | 'EMPLOYEE' | 'OTHER';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type PgGender = 'BOYS' | 'GIRLS' | 'CO_LIVING';
export type Cooling = 'AC' | 'NON_AC' | 'BOTH';
export type RoomType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'PREMIUM';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type VisitStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string;
  role: UserRole;
  userType: UserType | null;
  profileImage: string | null;
  lastLogin: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PgRoomTypeDetail {
  type: RoomType;
  pricePerBed: number;
  roomImage1: string | null;
  roomImage2: string | null;
  bathroomImage: string | null;
  otherImage: string | null;
}

/** The card shape returned by the catalogue list. Deliberately small: a list of
 *  40 of these travels over a patchy connection, so it carries no room photos. */
export interface PgSummary {
  id: string;
  pgCode: string;
  name: string;
  location: string;
  city: string | null;
  price: number | null;
  gender: PgGender | null;
  cooling: Cooling | null;
  foodIncluded: boolean;
  amenities: string[];
  /** First image only; the gallery is fetched with the detail. */
  coverImage: string | null;
  logo: string | null;
  verification: VerificationStatus;
  rating: number;
  reviewCount: number;
  /** Present only when the query supplied lat/lng. */
  distanceKm: number | null;
}

export interface PgDetail extends PgSummary {
  description: string | null;
  deposit: number | null;
  foodDetails: string | null;
  images: string[];
  roomTypes: PgRoomTypeDetail[];
  latitude: number | null;
  longitude: number | null;
  publishedAt: string | null;
  updatedAt: string;
}

export type PgSort = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'distance';

export interface PgSearchParams {
  q?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  gender?: PgGender;
  minPrice?: number;
  maxPrice?: number;
  roomType?: RoomType;
  amenities?: string[];
  foodIncluded?: boolean;
  verifiedOnly?: boolean;
  sort?: PgSort;
  cursor?: string;
  limit?: number;
}

export interface Page<T> {
  items: T[];
  /** Null when this is the last page. */
  nextCursor: string | null;
}

/** Facet metadata, so filter options are never hardcoded in the app. */
export interface PgFilterFacets {
  cities: string[];
  amenities: string[];
  priceRange: { min: number; max: number };
}

export interface VisitRequest {
  id: string;
  pgId: string;
  pgCode: string;
  pgName: string;
  fullName: string;
  phone: string;
  email: string;
  preferredDate: string | null;
  message: string | null;
  status: VisitStatus;
  /** The owner's number, revealed once the visit is CONFIRMED. */
  ownerPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitInput {
  pgId: string;
  preferredDate?: string;
  message?: string;
}
