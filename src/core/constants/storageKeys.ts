// Namespaced to prevent collisions with third-party libraries that use bare keys like "access_token"
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "@peerassess/access_token",
  REFRESH_TOKEN: "@peerassess/refresh_token",
  CACHED_USER: "@peerassess/cached_user",
} as const;
