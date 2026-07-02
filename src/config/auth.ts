// src/config/auth.ts
const AUTH_MODE = "session" as const;

export const AUTH = {
  mode: AUTH_MODE,
  isSession: true,
  isJWT: false,
} as const;