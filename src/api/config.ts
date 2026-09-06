import { Platform } from 'react-native';

/**
 * Where the API lives.
 *
 * `localhost` on an Android emulator is the emulator itself, not the host
 * machine, so a dev build there must call 10.0.2.2. Getting this wrong gives a
 * bare "Network request failed" with nothing pointing at the cause, which is
 * why it is handled here once rather than in each caller.
 *
 * A physical device on the same Wi-Fi needs the host's LAN address: set
 * DEV_LAN_HOST below to something like '192.168.1.7'.
 */
const DEV_PORT = 5000;
const DEV_LAN_HOST: string | null = null;

function devBaseUrl(): string {
  if (DEV_LAN_HOST) {
    return `http://${DEV_LAN_HOST}:${DEV_PORT}/api`;
  }
  return `http://${Platform.OS === 'android' ? '10.0.2.2' : 'localhost'}:${DEV_PORT}/api`;
}

export const API_BASE_URL = __DEV__ ? devBaseUrl() : 'https://api.pzee.in/api';

/** Anything slower than this is a hung connection, not a slow one. */
export const REQUEST_TIMEOUT_MS = 20_000;

/**
 * The catalogue list endpoint does not exist on the API yet — the only public
 * PG route is a lookup by code. Until `GET /v1/pg/public` lands, discovery
 * renders typed sample data so the screens can be built and reviewed.
 *
 * The fixtures are typed as the real `PgSummary`, so the day that endpoint
 * ships, any mismatch is a compile error rather than a blank list. Flipping
 * this to false is the whole switch-over.
 */
export const USE_FIXTURES = true;
