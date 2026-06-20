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

async function parseJsonResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export async function getSavedInternships(userId = CURRENT_USER_ID) {
  const res = await fetch(buildUrl('/api/bookmarks', { userId }));
  return parseJsonResponse(res);
}

export async function getBookmarkState(internshipId, userId = CURRENT_USER_ID) {
  const res = await fetch(buildUrl(`/api/bookmarks/${internshipId}`, { userId }));
  return parseJsonResponse(res);
}

export async function saveInternship(internshipId, userId = CURRENT_USER_ID) {
  const res = await fetch(`${API_BASE}/api/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ internshipId, userId }),
  });
  return parseJsonResponse(res);
}

export async function unsaveInternship(internshipId, userId = CURRENT_USER_ID) {
  const res = await fetch(buildUrl(`/api/bookmarks/${internshipId}`, { userId }), {
    method: 'DELETE',
  });
  return parseJsonResponse(res);
}

export async function findInternshipMatches(profile) {
  const res = await fetch(`${API_BASE}/api/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  return parseJsonResponse(res);
}
