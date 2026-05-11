async function requestJson(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options
  });

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

export function fetchMovies({ q, status } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return requestJson(`/api/movies${suffix}`);
}

export function createMovie(input) {
  return requestJson("/api/movies", { method: "POST", body: JSON.stringify(input) });
}

export function patchMovie(id, patch) {
  return requestJson(`/api/movies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
}

export function deleteMovie(id) {
  return requestJson(`/api/movies/${id}`, { method: "DELETE" });
}

