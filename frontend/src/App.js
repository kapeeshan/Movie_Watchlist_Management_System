import { useEffect, useMemo, useState } from "react";
import "./App.css";
import AuthForm from "./AuthForm";
import { useAuth } from "./AuthContext";
import {
  createList,
  createMovie,
  deleteList,
  deleteMovie,
  fetchLists,
  fetchMovies,
  patchMovie
} from "./api";

const STATUSES = [
  { value: "", label: "All" },
  { value: "planned", label: "Planned" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" }
];

function WatchlistApp() {
  const { user, logout } = useAuth();
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [newListName, setNewListName] = useState("");

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("planned");
  const [notes, setNotes] = useState("");

  const canSubmit = useMemo(() => title.trim().length > 0 && activeListId, [title, activeListId]);

  async function loadLists() {
    const res = await fetchLists();
    const data = res.data || [];
    setLists(data);
    if (!activeListId && data.length > 0) {
      setActiveListId(data[0]._id);
    } else if (activeListId && !data.find((l) => l._id === activeListId)) {
      setActiveListId(data[0]?._id || "");
    }
    return data;
  }

  async function loadMovies() {
    if (!activeListId) {
      setMovies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetchMovies(activeListId, {
        q: q.trim() || undefined,
        status: statusFilter || undefined
      });
      setMovies(res.data || []);
    } catch (e) {
      setError(e.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLists().catch((e) => setError(e.message || "Failed to load lists"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeListId, q, statusFilter]);

  async function onCreateList(e) {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    setError("");
    try {
      const res = await createList({ name });
      setNewListName("");
      await loadLists();
      setActiveListId(res.data._id);
    } catch (e2) {
      setError(e2.message || "Failed to create list");
    }
  }

  async function onDeleteList() {
    if (!activeListId) return;
    const list = lists.find((l) => l._id === activeListId);
    const ok = window.confirm(`Delete list "${list?.name}" and all its movies?`);
    if (!ok) return;
    setError("");
    try {
      await deleteList(activeListId);
      const data = await loadLists();
      setActiveListId(data[0]?._id || "");
    } catch (e) {
      setError(e.message || "Failed to delete list");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    try {
      await createMovie(activeListId, {
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
      await loadMovies();
    } catch (e2) {
      setError(e2.message || "Failed to create movie");
    }
  }

  async function onCycleStatus(movie) {
    const next =
      movie.status === "planned" ? "watching" : movie.status === "watching" ? "completed" : "planned";
    setError("");
    try {
      await patchMovie(activeListId, movie._id, { status: next });
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
      await deleteMovie(activeListId, movie._id);
      setMovies((prev) => prev.filter((m) => m._id !== movie._id));
    } catch (e) {
      setError(e.message || "Failed to delete movie");
    }
  }

  return (
    <div className="Shell">
      <header className="Topbar">
        <div className="Topbar-inner">
          <div className="Brand">
            <div className="Brand-title">Movie Watchlist</div>
            <div className="Brand-subtitle">
              {user.displayName || user.email}
            </div>
          </div>
          <button className="Button Button--ghost" type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="Main">
        <section className="Card">
          <div className="Card-title">Your lists</div>
          <form className="List-form" onSubmit={onCreateList}>
            <input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="New list name"
            />
            <button className="Button" type="submit" disabled={!newListName.trim()}>
              Add list
            </button>
          </form>
          <div className="List-picker">
            <select
              value={activeListId}
              onChange={(e) => setActiveListId(e.target.value)}
              className="Input"
            >
              {lists.length === 0 ? (
                <option value="">No lists yet</option>
              ) : (
                lists.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))
              )}
            </select>
            <button
              className="Button Button--danger"
              type="button"
              onClick={onDeleteList}
              disabled={!activeListId}
            >
              Delete list
            </button>
          </div>
        </section>

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
                <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Sci-Fi" />
              </label>
              <label className="Field">
                <span className="Field-label">Rating (0-10)</span>
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
              <button className="Button Button--ghost" type="button" onClick={loadMovies}>
                Refresh
              </button>
            </div>
          </form>
        </section>

        <section className="Card">
          <div className="Card-row">
            <div className="Card-title">Movies in list</div>
            <div className="Filters">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="Input"
                placeholder="Search title..."
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
            <div className="Empty">Loading...</div>
          ) : !activeListId ? (
            <div className="Empty">Create or select a list to get started.</div>
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
                      {typeof m.rating === "number" ? (
                        <span className="Item-muted">Rating: {m.rating}</span>
                      ) : null}
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

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="Shell">
        <div className="Empty Auth-loading">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="Shell">
        <header className="Topbar">
          <div className="Brand">
            <div className="Brand-title">Movie Watchlist</div>
            <div className="Brand-subtitle">Sign in to manage your lists</div>
          </div>
        </header>
        <AuthForm />
      </div>
    );
  }

  return <WatchlistApp />;
}

export default App;
