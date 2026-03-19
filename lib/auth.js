// Token is stored in React state (memory only) via AuthContext
// This file provides helpers for SSR/edge contexts

export function getRefreshTokenFromCookie(cookieString) {
  if (!cookieString) return null;
  const match = cookieString.match(/refreshToken=([^;]+)/);
  return match ? match[1] : null;
}

export function getRoleFromCookie(cookieString) {
  if (!cookieString) return null;
  const match = cookieString.match(/userRole=([^;]+)/);
  return match ? match[1] : null;
}
