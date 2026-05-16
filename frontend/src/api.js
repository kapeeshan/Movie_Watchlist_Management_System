const TOKEN_KEY = "watchlist_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function requestJson(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });

  if (res.status === 204) return { ok: true, data: null };

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = payload?.error?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return payload;
}

export function register({ email, password, displayName }) {
  return requestJson("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, displayName })
  });
}

export function login({ email, password }) {
  return requestJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function fetchMe() {
  return requestJson("/api/auth/me");
}

export function fetchLists() {
  return requestJson("/api/lists");
}

export function createList(input) {
  return requestJson("/api/lists", { method: "POST", body: JSON.stringify(input) });
}

export function deleteList(id) {
  return requestJson(`/api/lists/${id}`, { method: "DELETE" });
}

export function fetchMovies(listId, { q, status } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return requestJson(`/api/lists/${listId}/movies${suffix}`);
}

export function createMovie(listId, input) {
  return requestJson(`/api/lists/${listId}/movies`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function patchMovie(listId, id, patch) {
  return requestJson(`/api/lists/${listId}/movies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
}

export function deleteMovie(listId, id) {
  return requestJson(`/api/lists/${listId}/movies/${id}`, { method: "DELETE" });
}
