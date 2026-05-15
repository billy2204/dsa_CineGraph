import { useState, useEffect, useRef } from "react";
import {
  Search, SlidersHorizontal, X, Film, Star, LogOut,
  Network, ChevronDown, ChevronUp, Sparkles, User, TrendingUp
} from "lucide-react";
import {
  MOVIES, ALL_GENRES, ALL_ACTORS, ALL_DIRECTORS,
  searchMovies, getRecommendations, SearchResult, Recommendation, Movie
} from "./movieData";
import { MovieCard } from "./MovieCard";
import { MovieModal } from "./MovieModal";

interface SearchPageProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

const RATING_OPTIONS = [9, 8.5, 8, 7.5, 7, 6.5, 6];

export function SearchPage({ user, onLogout }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters
  const [filterGenre, setFilterGenre] = useState("");
  const [filterMinYear, setFilterMinYear] = useState(1970);
  const [filterMaxYear, setFilterMaxYear] = useState(2024);
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [filterActor, setFilterActor] = useState("");
  const [filterDirector, setFilterDirector] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    const res = searchMovies(debouncedQuery, {
      genre: filterGenre,
      minYear: filterMinYear > 1970 ? filterMinYear : undefined,
      maxYear: filterMaxYear < 2024 ? filterMaxYear : undefined,
      minRating: filterMinRating > 0 ? filterMinRating : undefined,
      actor: filterActor,
      director: filterDirector,
    });
    setResults(res);
    if (debouncedQuery || filterGenre || filterActor || filterDirector) {
      setHasSearched(true);
    }
  }, [debouncedQuery, filterGenre, filterMinYear, filterMaxYear, filterMinRating, filterActor, filterDirector]);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    const recs = getRecommendations(movie, MOVIES);
    setRecommendations(recs);
    setShowRecommendations(true);
  };

  const clearFilters = () => {
    setFilterGenre("");
    setFilterMinYear(1970);
    setFilterMaxYear(2024);
    setFilterMinRating(0);
    setFilterActor("");
    setFilterDirector("");
  };

  const hasActiveFilters = filterGenre || filterMinYear > 1970 || filterMaxYear < 2024 || filterMinRating > 0 || filterActor || filterDirector;
  const trendingMovies = [...MOVIES].sort((a, b) => b.rating - a.rating).slice(0, 6);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f0a14 50%, #0a0a1a 100%)" }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-40 px-4 md:px-8 py-3 flex items-center justify-between"
        style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF2D55, #FF6B35)" }}>
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-white" style={{ fontWeight: "800", fontSize: "1.2rem" }}>CineGraph</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300" style={{ fontSize: "0.85rem" }}>{user.name}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.85rem" }}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Hero search section */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Network className="w-5 h-5" style={{ color: "#FF2D55" }} />
            <span style={{ color: "#FF2D55", fontWeight: "600", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Graph-Based Movie Engine</span>
          </div>
          <h1 className="text-white mb-3" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "800", lineHeight: "1.2" }}>
            Discover Movies Through<br />
            <span style={{ background: "linear-gradient(135deg, #FF2D55, #FF6B35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Graph Intelligence
            </span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto" style={{ fontSize: "0.95rem" }}>
            Search by title, actor, director, genre, or keywords. Our graph engine finds connections you'll love.
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, actors, directors, genres..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
              style={{ fontSize: "0.95rem" }}
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-500 hover:text-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
              style={{
                background: hasActiveFilters ? "rgba(255,45,85,0.2)" : "rgba(255,255,255,0.06)",
                color: hasActiveFilters ? "#FF2D55" : "#9ca3af",
                border: `1px solid ${hasActiveFilters ? "rgba(255,45,85,0.4)" : "rgba(255,255,255,0.08)"}`,
                fontSize: "0.8rem",
                fontWeight: "600",
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div
              className="mt-3 p-5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white" style={{ fontWeight: "700", fontSize: "0.9rem" }}>Filters</span>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-red-400 hover:text-red-300 transition-colors" style={{ fontSize: "0.8rem" }}>
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Genre */}
                <div>
                  <label className="block text-gray-400 mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Genre</label>
                  <select
                    value={filterGenre}
                    onChange={(e) => setFilterGenre(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.85rem", color: filterGenre ? "white" : "#6b7280" }}
                  >
                    <option value="">All Genres</option>
                    {ALL_GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-gray-400 mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Min Rating</label>
                  <select
                    value={filterMinRating}
                    onChange={(e) => setFilterMinRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.85rem" }}
                  >
                    <option value={0}>Any Rating</option>
                    {RATING_OPTIONS.map((r) => <option key={r} value={r}>★ {r}+</option>)}
                  </select>
                </div>

                {/* Director */}
                <div>
                  <label className="block text-gray-400 mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Director</label>
                  <select
                    value={filterDirector}
                    onChange={(e) => setFilterDirector(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.85rem", color: filterDirector ? "white" : "#6b7280" }}
                  >
                    <option value="">All Directors</option>
                    {ALL_DIRECTORS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Actor */}
                <div>
                  <label className="block text-gray-400 mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actor</label>
                  <input
                    type="text"
                    placeholder="e.g. Leonardo DiCaprio"
                    value={filterActor}
                    onChange={(e) => setFilterActor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-white placeholder-gray-500 outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.85rem" }}
                  />
                </div>

                {/* Year range */}
                <div>
                  <label className="block text-gray-400 mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Min Year</label>
                  <input
                    type="number"
                    min={1970} max={2024}
                    value={filterMinYear}
                    onChange={(e) => setFilterMinYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Max Year</label>
                  <input
                    type="number"
                    min={1970} max={2024}
                    value={filterMaxYear}
                    onChange={(e) => setFilterMaxYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick genre chips */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {["Action", "Sci-Fi", "Drama", "Thriller", "Crime", "Animation", "Romance"].map((g) => (
            <button
              key={g}
              onClick={() => setFilterGenre(filterGenre === g ? "" : g)}
              className="px-4 py-1.5 rounded-full transition-all"
              style={{
                background: filterGenre === g ? "linear-gradient(135deg, #FF2D55, #FF6B35)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${filterGenre === g ? "transparent" : "rgba(255,255,255,0.1)"}`,
                color: filterGenre === g ? "white" : "#9ca3af",
                fontSize: "0.8rem",
                fontWeight: "600",
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" style={{ color: "#FF2D55" }} />
                <h2 className="text-white" style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                  Search Results
                </h2>
                <span className="px-2 py-0.5 rounded-full text-gray-400" style={{ background: "rgba(255,255,255,0.07)", fontSize: "0.75rem" }}>
                  {results.length} found
                </span>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-16">
                <Film className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500" style={{ fontSize: "1rem" }}>No movies found. Try different keywords or adjust filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((result) => (
                  <MovieCard
                    key={result.movie.id}
                    movie={result.movie}
                    score={result.score}
                    matchReasons={result.matchReasons}
                    onClick={handleMovieClick}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Graph Recommendations section */}
        {showRecommendations && recommendations.length > 0 && (
          <div className="mb-10">
            <div
              className="p-5 rounded-2xl mb-5"
              style={{ background: "linear-gradient(135deg, rgba(255,45,85,0.08), rgba(255,107,53,0.05))", border: "1px solid rgba(255,45,85,0.2)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,45,85,0.2)" }}>
                    <Sparkles className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-white" style={{ fontWeight: "700", fontSize: "1.1rem" }}>Graph-Based Recommendations</h2>
                    <p className="text-gray-400" style={{ fontSize: "0.8rem" }}>
                      Because you viewed <span style={{ color: "#FF2D55", fontWeight: "600" }}>{selectedMovie?.title}</span> — sorted by graph similarity score
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowRecommendations(false)} className="text-gray-500 hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recommendations.map((rec) => (
                <MovieCard
                  key={rec.movie.id}
                  movie={rec.movie}
                  recommendationExplanation={rec.explanation}
                  onClick={handleMovieClick}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        {/* Trending / Default view */}
        {!hasSearched && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5" style={{ color: "#FF2D55" }} />
              <h2 className="text-white" style={{ fontWeight: "700", fontSize: "1.2rem" }}>Top Rated Films</h2>
              <span className="text-gray-500" style={{ fontSize: "0.8rem" }}>Click any movie to get graph recommendations</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trendingMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={handleMovieClick}
                  compact
                />
              ))}
            </div>

            {/* Graph info banner */}
            <div
              className="mt-10 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Network className="w-10 h-10 flex-shrink-0" style={{ color: "#FF2D55" }} />
              <div>
                <h3 className="text-white mb-1" style={{ fontWeight: "700" }}>How Graph-Based Recommendations Work</h3>
                <p className="text-gray-400" style={{ fontSize: "0.85rem", lineHeight: "1.6" }}>
                  Every movie is a <strong className="text-white">node</strong> connected to genre, actor, director, and keyword nodes via weighted edges.
                  Recommendations are ranked by <strong className="text-white">shared graph connections</strong>:
                  same director (×0.5), shared actors (×0.4), similar genres (×0.3), common themes (×0.2).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Movie Detail Modal */}
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
}
