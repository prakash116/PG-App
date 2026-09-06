/**
 * The API contract, mirrored by hand from PG-Backend's Prisma schema and its
 * Swagger models. Field names match the server's spelling exactly rather than
 * being renamed to something nicer, so that generating these from
 * /api/docs-json later is a drop-in replacement.
 */

export type UserRole = 'SUPER_ADMIN' | 'PG_OWNER' | 'USER';
export type UserType = 'STUDENT' | 'TOURIST' | 'WORKING_PROFESSIONAL' | 'EMPLOYEE' | 'OTHER';
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

export interface LoginPayload {
  /** Email address or phone number — the API accepts either. */
  identifier: string;
  password: string;
}

export interface PgRoomTypeDetail {
  type: RoomType;
  pricePerBed: number;
  roomImage1: string | null;
  roomImage2: string | null;
  bathroomImage: string | null;
  otherImage: string | null;
}

/** The card shape. Deliberately small: a page of these travels over a patchy
 *  connection, so no room photos and no description. */
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
  coverImage: string | null;
  logo: string | null;
  verification: VerificationStatus;
  verified: boolean;
  rating: number;
  reviewCount: number;
}

/** What GET /v1/pg/public/:pgCode returns today. Note it has no `id`: the
 *  public lookup exposes the shareable code instead. */
export interface PublicPgDetail {
  pgCode: string;
  name: string;
  location: string;
  city: string | null;
  description: string | null;
  price: number | null;
  deposit: number | null;
  gender: PgGender | null;
  cooling: Cooling | null;
  foodIncluded: boolean;
  foodDetails: string | null;
  amenities: string[];
  images: string[];
  logo: string | null;
  verification: VerificationStatus;
  verified: boolean;
  rating: number;
  reviewCount: number;
  roomTypes: PgRoomTypeDetail[];
}

export interface VisitRequest {
  id: string;
  pgId: string;
  fullName: string;
  phone: string;
  email: string;
  preferredDate: string | null;
  message: string | null;
  status: VisitStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitPayload {
  pgCode: string;
  preferredDate?: string;
  message?: string;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/** Filters the discovery screen can apply. Only `q` and the client-side ones
 *  do anything while fixtures are in play. */
export interface PgSearchParams {
  q?: string;
  city?: string;
  gender?: PgGender;
  minPrice?: number;
  maxPrice?: number;
  foodIncluded?: boolean;
  verifiedOnly?: boolean;
}
