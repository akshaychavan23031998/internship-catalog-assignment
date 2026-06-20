// Tiny helpers shared across the app.
// In a real app these would come from auth; for the assignment we hardcode a userId.

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export const CURRENT_USER_ID = 'demo-user';

export function buildUrl(path, params = {}) {
  const url = new URL(path, API_BASE);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, v));
    } else {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}
