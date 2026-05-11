import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { createMovie, deleteMovie, fetchMovies, patchMovie } from "./api";

const STATUSES = [
  { value: "", label: "All" },
  { value: "planned", label: "Planned" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" }
];

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("planned");
  const [notes, setNotes] = useState("");

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchMovies({ q: q.trim() || undefined, status: statusFilter || undefined });
      setMovies(res.data || []);
    } catch (e) {
      setError(e.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, statusFilter]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    try {
      await createMovie({
        title: title.trim(),
        year: year ? Number(year) : undefined,
        genre: genre.trim() || undefined,
        rating: rating ? Number(rating) : undefined,
        status,
        notes: notes.trim() || undefined
      });
      setTitle("");
      setYear("");
      setGenre("");
      setRating("");
      setStatus("planned");
      setNotes("");
      await load();
    } catch (e2) {
      setError(e2.message || "Failed to create movie");
    }
  }

  async function onCycleStatus(movie) {
    const next =
      movie.status === "planned" ? "watching" : movie.status === "watching" ? "completed" : "planned";
    setError("");
    try {
      await patchMovie(movie._id, { status: next });
      setMovies((prev) => prev.map((m) => (m._id === movie._id ? { ...m, status: next } : m)));
    } catch (e) {
      setError(e.message || "Failed to update status");
    }
  }

  async function onDelete(movie) {
    const ok = window.confirm(`Delete "${movie.title}"?`);
    if (!ok) return;
    setError("");
    try {
      await deleteMovie(movie._id);
      setMovies((prev) => prev.filter((m) => m._id !== movie._id));
    } catch (e) {
      setError(e.message || "Failed to delete movie");
    }
  }

  return (
    <div className="Shell">
      <header className="Topbar">
        <div className="Brand">
          <div className="Brand-title">Movie Watchlist</div>
          <div className="Brand-subtitle">MERN (Express + MongoDB + React)</div>
        </div>
      </header>

      <main className="Main">
        <section className="Card">
          <div className="Card-title">Add a movie</div>
          <form className="Form" onSubmit={onSubmit}>
            <div className="Grid">
              <label className="Field">
                <span className="Field-label">Title *</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Inception" />
              </label>
              <label className="Field">
                <span className="Field-label">Year</span>
                <input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  inputMode="numeric"
                  placeholder="2010"
                />
              </label>
              <label className="Field">
                <span className="Field-label">Genre</span>
                <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Sci‑Fi" />
              </label>
              <label className="Field">
                <span className="Field-label">Rating (0–10)</span>
                <input
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  inputMode="decimal"
                  placeholder="8.5"
                />
              </label>
              <label className="Field">
                <span className="Field-label">Status</span>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="planned">Planned</option>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <label className="Field Field--span2">
                <span className="Field-label">Notes</span>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
              </label>
            </div>
            <div className="Form-actions">
              <button className="Button" type="submit" disabled={!canSubmit}>
                Add
              </button>
              <button className="Button Button--ghost" type="button" onClick={load}>
                Refresh
              </button>
            </div>
          </form>
        </section>

        <section className="Card">
          <div className="Card-row">
            <div className="Card-title">Your watchlist</div>
            <div className="Filters">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="Input"
                placeholder="Search title…"
              />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="Input">
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? <div className="Alert">{error}</div> : null}

          {loading ? (
            <div className="Empty">Loading…</div>
          ) : movies.length === 0 ? (
            <div className="Empty">No movies yet. Add your first one above.</div>
          ) : (
            <ul className="List">
              {movies.map((m) => (
                <li key={m._id} className="Item">
                  <div className="Item-main">
                    <div className="Item-title">
                      {m.title} {m.year ? <span className="Item-muted">({m.year})</span> : null}
                    </div>
                    <div className="Item-meta">
                      <span className={`Pill Pill--${m.status}`}>{m.status}</span>
                      {m.genre ? <span className="Item-muted">{m.genre}</span> : null}
                      {typeof m.rating === "number" ? <span className="Item-muted">Rating: {m.rating}</span> : null}
                      {m.notes ? <span className="Item-muted">Notes: {m.notes}</span> : null}
                    </div>
                  </div>
                  <div className="Item-actions">
                    <button className="Button Button--ghost" onClick={() => onCycleStatus(m)}>
                      Next status
                    </button>
                    <button className="Button Button--danger" onClick={() => onDelete(m)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
