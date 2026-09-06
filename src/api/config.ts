import { Platform } from 'react-native';

/**
 * Where the API lives.
 *
 * `localhost` on an Android emulator is the emulator itself, not the host
 * machine, so a dev build there must call 10.0.2.2 instead. Getting this wrong
 * produces a bare "Network request failed" with nothing pointing at the cause,
 * which is why it is handled here once rather than in each caller.
 *
 * A physical device on the same Wi-Fi needs the host's LAN address: set
 * PZEE_API_URL when building, or edit DEV_LAN_HOST below.
 */
const DEV_PORT = 5000;
const DEV_LAN_HOST: string | null = null; // e.g. '192.168.1.7'

function devBaseUrl(): string {
  if (DEV_LAN_HOST) {
    return `http://${DEV_LAN_HOST}:${DEV_PORT}/api`;
  }

  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:${DEV_PORT}/api`;
}

export const API_BASE_URL = __DEV__ ? devBaseUrl() : 'https://api.pzee.in/api';

/** Anything slower than this is a hung connection, not a slow one. */
export const REQUEST_TIMEOUT_MS = 20_000;

/**
 * The catalogue endpoints are Milestone 0 backend work and do not exist yet.
 * Until they do, discovery renders typed fixtures so the UI can be built and
 * reviewed. Flip this to false the day GET /v1/pg/public lands — the types are
 * shared, so anything that does not line up becomes a compile error.
 */
export const USE_FIXTURES = __DEV__;
