import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Film,
  LogOut,
  Sparkles,
  User,
  Settings,
  Heart,
  Globe2,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw,
  List,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import {
  MOVIES,
  ALL_COUNTRIES,
  ALL_DIRECTORS,
  ALL_GENRES,
  DEFAULT_USER_TASTE,
  UserTaste,
  getRecommendations,
  getTasteRecommendations,
  movieCountries,
  searchMovies,
  Recommendation,
  SearchResult,
  Movie,
} from "./movieData";
import { getMoviesFromApi, getRecommendationsFromApi, searchMoviesFromApi } from "./movieApi";
import { MovieCard } from "./MovieCard";
import { MovieModal } from "./MovieModal";

interface SearchPageProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

type AppTab = "explore" | "taste" | "recommendations" | "profile";
type Language = "vi" | "en";
type ThemeMode = "dark" | "light";

interface UserProfile {
  name: string;
  email: string;
  city: string;
}

const CURRENT_YEAR = 2026;
const RATING_OPTIONS = [9, 8.5, 8, 7.5, 7, 6.5, 6];
const SHELF_SIZE = 12;
const STORAGE_KEYS = {
  taste: "cinegraph:taste",
  profile: "cinegraph:profile",
  language: "cinegraph:language",
  theme: "cinegraph:theme",
  sidebarCollapsed: "cinegraph:sidebar-collapsed",
};

const COPY = {
  vi: {
    brandTag: "Movie graph",
    explore: "Khám phá",
    taste: "Gu phim",
    recommendations: "Gợi ý",
    profile: "Hồ sơ",
    logout: "Đăng xuất",
    searchPlaceholder: "Tìm phim, diễn viên, đạo diễn, thể loại...",
    filters: "Bộ lọc",
    clear: "Xóa",
    genre: "Thể loại",
    country: "Quốc gia",
    rating: "Điểm tối thiểu",
    director: "Đạo diễn",
    actor: "Diễn viên",
    minYear: "Từ năm",
    maxYear: "Đến năm",
    allGenres: "Mọi thể loại",
    allCountries: "Mọi quốc gia",
    allDirectors: "Mọi đạo diễn",
    anyRating: "Mọi điểm",
    searchResults: "Kết quả tìm kiếm",
    found: "phim",
    searching: "Đang tìm...",
    noMovies: "Không tìm thấy phim phù hợp.",
    defaultTitle: "Phim mới ra mắt",
    defaultHint: "Sắp xếp theo thời gian phát hành gần đây, ưu tiên phim có rating tốt",
    topRated: "Top phim nổi bật",
    recommendationTitle: "Gợi ý rõ ràng",
    recommendationHint: "Chọn một phim để xem recommendation theo graph, hoặc dùng gu phim của bạn.",
    threshold: "Độ khớp tối thiểu",
    broad: "Rộng",
    strict: "Chặt",
    all: "Xem tất cả",
    collapse: "Thu gọn",
    askTitle: "Hỏi gu phim",
    askIntro: "Các lựa chọn này được dùng làm weight cho recommendation.",
    preferredGenres: "Bạn thích thể loại nào?",
    preferredCountries: "Bạn thích phim nước nào?",
    preferredActors: "Diễn viên yêu thích",
    preferredDirectors: "Đạo diễn yêu thích",
    preferredKeywords: "Từ khóa/chủ đề",
    weights: "Trọng số recommendation",
    saveTaste: "Lưu gu phim",
    resetTaste: "Đặt lại",
    saved: "Đã lưu",
    profileTitle: "Cài đặt hồ sơ",
    personalInfo: "Thông tin cá nhân",
    displayName: "Tên hiển thị",
    email: "Email",
    city: "Thành phố",
    appearance: "Giao diện",
    language: "Ngôn ngữ",
    updateTaste: "Chỉnh gu phim",
    apiFallback: "Backend API chưa kết nối, đang hiển thị dữ liệu local.",
    apiRecommendationFallback: "Backend API chưa kết nối, recommendation dùng fallback local.",
    collapseSidebar: "Thu gọn menu",
    expandSidebar: "Mở rộng menu",
  },
  en: {
    brandTag: "Movie graph",
    explore: "Explore",
    taste: "Taste",
    recommendations: "Recommend",
    profile: "Profile",
    logout: "Logout",
    searchPlaceholder: "Search movies, actors, directors, genres...",
    filters: "Filters",
    clear: "Clear",
    genre: "Genre",
    country: "Country",
    rating: "Minimum rating",
    director: "Director",
    actor: "Actor",
    minYear: "From year",
    maxYear: "To year",
    allGenres: "All genres",
    allCountries: "All countries",
    allDirectors: "All directors",
    anyRating: "Any rating",
    searchResults: "Search results",
    found: "movies",
    searching: "Searching...",
    noMovies: "No matching movies found.",
    defaultTitle: "Recently released",
    defaultHint: "Sorted by recent release year, with rating as a tie-breaker",
    topRated: "Top rated films",
    recommendationTitle: "Clear recommendations",
    recommendationHint: "Pick a movie for graph recommendations, or use your taste profile.",
    threshold: "Minimum match score",
    broad: "Broad",
    strict: "Strict",
    all: "View all",
    collapse: "Collapse",
    askTitle: "Movie taste questions",
    askIntro: "These answers become weights for recommendations.",
    preferredGenres: "Which genres do you like?",
    preferredCountries: "Which countries do you prefer?",
    preferredActors: "Favorite actors",
    preferredDirectors: "Favorite directors",
    preferredKeywords: "Keywords/themes",
    weights: "Recommendation weights",
    saveTaste: "Save taste",
    resetTaste: "Reset",
    saved: "Saved",
    profileTitle: "Profile settings",
    personalInfo: "Personal info",
    displayName: "Display name",
    email: "Email",
    city: "City",
    appearance: "Appearance",
    language: "Language",
    updateTaste: "Edit movie taste",
    apiFallback: "Backend API is not reachable, showing local data.",
    apiRecommendationFallback: "Backend API is not reachable, recommendations use local fallback.",
    collapseSidebar: "Collapse menu",
    expandSidebar: "Expand menu",
  },
};

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      fallback &&
      typeof fallback === "object" &&
      !Array.isArray(fallback)
    ) {
      return { ...fallback, ...parsed };
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toggleArrayValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function regionKey(movie: Movie) {
  const countries = movieCountries(movie).join(" ").toLowerCase();
  if (countries.includes("vietnam")) return "vietnam";
  if (countries.includes("united states")) return "us";
  if (countries.includes("south korea")) return "korea";
  if (countries.includes("japan")) return "japan";
  if (countries.includes("china") || countries.includes("hong kong") || countries.includes("taiwan")) return "china";
  if (countries.includes("france") || countries.includes("united kingdom") || countries.includes("germany") || countries.includes("spain")) return "europe";
  return "other";
}

function regionLabel(key: string, language: Language) {
  const labels: Record<string, Record<Language, string>> = {
    vietnam: { vi: "Phim Việt", en: "Vietnamese films" },
    us: { vi: "Phim Mỹ", en: "US films" },
    korea: { vi: "Phim Hàn", en: "Korean films" },
    japan: { vi: "Phim Nhật", en: "Japanese films" },
    china: { vi: "Phim Hoa ngữ", en: "Chinese-language films" },
    europe: { vi: "Phim châu Âu", en: "European films" },
    other: { vi: "Khu vực khác", en: "Other regions" },
  };
  return labels[key]?.[language] ?? labels.other[language];
}

function groupResults(results: SearchResult[], language: Language) {
  const order = ["vietnam", "us", "korea", "japan", "china", "europe", "other"];
  const grouped = new Map<string, SearchResult[]>();
  for (const result of results) {
    const key = regionKey(result.movie);
    grouped.set(key, [...(grouped.get(key) ?? []), result]);
  }
  return order
    .filter((key) => grouped.has(key))
    .map((key) => ({ key, title: regionLabel(key, language), items: grouped.get(key)! }));
}

function clampWeight(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatSearchMeta(count: number, foundLabel: string, searchTimeMs: number | null) {
  const base = `${count} ${foundLabel}`;
  if (searchTimeMs === null) return base;
  const safeTime = Math.max(0, Math.round(searchTimeMs));
  return `${base} | ${safeTime} ms`;
}

function PreferenceSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const safeValue = clampWeight(value);
  const rangeStyle = { "--range-progress": `${safeValue}%` } as CSSProperties;
  const updateValue = (nextValue: number) => onChange(clampWeight(nextValue));
  const inputId = `weight-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="cine-weight-control">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold" htmlFor={inputId} style={{ color: "var(--text-secondary)" }}>{label}</label>
        <input
          id={inputId}
          className="cine-weight-input"
          type="number"
          min={0}
          max={100}
          step={1}
          value={safeValue}
          onChange={(event) => updateValue(Number(event.target.value))}
          aria-label={`${label} weight`}
        />
      </div>
      <input
        className="cine-range"
        type="range"
        min={0}
        max={100}
        step={1}
        value={safeValue}
        style={rangeStyle}
        onChange={(event) => updateValue(Number(event.target.value))}
        aria-label={`${label} weight slider`}
      />
    </div>
  );
}

function ChipPicker({
  items,
  selected,
  onToggle,
}: {
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className="px-3 py-1.5 rounded-full transition-colors"
            style={{
              color: active ? "white" : "var(--text-secondary)",
              background: active ? "linear-gradient(135deg, #E11D48, #F97316)" : "var(--surface-muted)",
              border: active ? "1px solid transparent" : "1px solid var(--border-soft)",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function MovieShelf({
  title,
  hint,
  results,
  onMovieClick,
  language,
  emptyText,
}: {
  title: string;
  hint?: string;
  results: Array<SearchResult | Recommendation>;
  onMovieClick: (movie: Movie) => void;
  language: Language;
  emptyText: string;
}) {
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const totalPages = Math.max(1, Math.ceil(results.length / SHELF_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visibleResults = showAll ? results : results.slice(safePage * SHELF_SIZE, safePage * SHELF_SIZE + SHELF_SIZE);
  const canPage = results.length > SHELF_SIZE && !showAll;

  useEffect(() => {
    setPage(0);
    setShowAll(false);
  }, [results]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 style={{ color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: 850 }}>{title}</h2>
            <span className="rounded-full px-2 py-0.5" style={{ color: "var(--text-muted)", background: "var(--surface-muted)", fontSize: "0.74rem", fontWeight: 700 }}>
              {results.length}
            </span>
          </div>
          {hint && <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{hint}</p>}
        </div>

        {results.length > SHELF_SIZE && (
          <div className="flex items-center gap-2">
            {canPage && (
              <>
                <button
                  aria-label="Previous page"
                  className="cine-icon-button"
                  type="button"
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  disabled={safePage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  aria-label="Next page"
                  className="cine-icon-button"
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                  disabled={safePage >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
            <button className="cine-secondary-button" type="button" onClick={() => setShowAll((value) => !value)}>
              <List className="h-4 w-4" />
              {showAll ? COPY[language].collapse : COPY[language].all}
            </button>
          </div>
        )}
      </div>

      {visibleResults.length === 0 ? (
        <div className="rounded-lg px-4 py-12 text-center" style={{ color: "var(--text-muted)", border: "1px solid var(--border-soft)", background: "var(--surface-card)" }}>
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {visibleResults.map((item) => {
            const movie = item.movie;
            const matchReasons = "matchReasons" in item ? item.matchReasons : undefined;
            const explanation = "explanation" in item ? item.explanation : undefined;
            return (
              <MovieCard
                key={movie.id}
                movie={movie}
                score={item.score}
                matchReasons={matchReasons}
                recommendationExplanation={explanation}
                onClick={onMovieClick}
                compact
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export function SearchPage({ user, onLogout }: SearchPageProps) {
  const [language, setLanguage] = useState<Language>(() => readStored<Language>(STORAGE_KEYS.language, "vi"));
  const [theme, setTheme] = useState<ThemeMode>(() => readStored<ThemeMode>(STORAGE_KEYS.theme, "dark"));
  const [activeTab, setActiveTab] = useState<AppTab>("explore");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => readStored<boolean>(STORAGE_KEYS.sidebarCollapsed, false));
  const [profile, setProfile] = useState<UserProfile>(() =>
    readStored<UserProfile>(STORAGE_KEYS.profile, {
      name: user.name,
      email: user.email,
      city: "Ho Chi Minh City",
    })
  );
  const [taste, setTaste] = useState<UserTaste>(() => readStored<UserTaste>(STORAGE_KEYS.taste, DEFAULT_USER_TASTE));
  const [tasteDraft, setTasteDraft] = useState<UserTaste>(taste);
  const [saveStatus, setSaveStatus] = useState("");

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchTimeMs, setSearchTimeMs] = useState<number | null>(null);
  const [catalogMovies, setCatalogMovies] = useState<Movie[]>([]);
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);
  const [seedMovie, setSeedMovie] = useState<Movie | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationThreshold, setRecommendationThreshold] = useState(45);
  const [apiError, setApiError] = useState("");

  const [filterGenre, setFilterGenre] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterMinYear, setFilterMinYear] = useState(1970);
  const [filterMaxYear, setFilterMaxYear] = useState(CURRENT_YEAR);
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [filterActor, setFilterActor] = useState("");
  const [filterDirector, setFilterDirector] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = COPY[language];
  const userId = profile.email || profile.name || user.email || user.name;

  useEffect(() => {
    document.documentElement.dataset.cineTheme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.language, JSON.stringify(language));
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingCatalog(true);

    getMoviesFromApi(96, 0, controller.signal)
      .then((movies) => {
        setCatalogMovies(movies);
        setApiError("");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setCatalogMovies(MOVIES);
        setApiError(t.apiFallback);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingCatalog(false);
      });

    return () => controller.abort();
  }, [t.apiFallback]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const filters = useMemo(
    () => ({
      genre: filterGenre,
      country: filterCountry,
      minYear: filterMinYear > 1970 ? filterMinYear : undefined,
      maxYear: filterMaxYear < CURRENT_YEAR ? filterMaxYear : undefined,
      minRating: filterMinRating > 0 ? filterMinRating : undefined,
      actor: filterActor,
      director: filterDirector,
    }),
    [filterGenre, filterCountry, filterMinYear, filterMaxYear, filterMinRating, filterActor, filterDirector]
  );

  const hasActiveFilters = Boolean(filterGenre || filterCountry || filterMinYear > 1970 || filterMaxYear < CURRENT_YEAR || filterMinRating > 0 || filterActor || filterDirector);
  const groupedSearchResults = useMemo(() => groupResults(results, language), [results, language]);
  const defaultMoviePool = catalogMovies.length > 0 ? catalogMovies : MOVIES;
  const tasteRecommendations = useMemo(() => getTasteRecommendations(defaultMoviePool, taste, 48), [defaultMoviePool, taste]);
  const recentMovies = useMemo(
    () => [...defaultMoviePool]
      .sort((a, b) => b.year - a.year || b.rating - a.rating || a.title.localeCompare(b.title))
      .slice(0, 48)
      .map((movie) => ({ movie, score: Math.round(movie.rating * 10), matchReasons: [] })),
    [defaultMoviePool]
  );
  const topRatedMovies = useMemo(
    () => [...defaultMoviePool].sort((a, b) => b.rating - a.rating).slice(0, 36).map((movie) => ({ movie, score: movie.rating * 10, matchReasons: [] })),
    [defaultMoviePool]
  );

  useEffect(() => {
    const hasSearchIntent = Boolean(debouncedQuery || hasActiveFilters);
    if (!hasSearchIntent) {
      setHasSearched(false);
      setResults([]);
      setSearchTimeMs(null);
      setApiError("");
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setHasSearched(true);
    setIsSearching(true);
    setSearchTimeMs(null);

    searchMoviesFromApi(debouncedQuery, filters, userId, taste, controller.signal)
      .then((apiResults) => {
        setResults(apiResults.items);
        setSearchTimeMs(apiResults.searchTimeMs ?? null);
        setApiError("");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        const localResults = searchMovies(debouncedQuery, filters, taste, 72);
        setResults(localResults);
        setSearchTimeMs(null);
        setApiError(t.apiFallback);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsSearching(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, filters, hasActiveFilters, taste, t.apiFallback, userId]);

  const loadRecommendations = (movie: Movie, threshold = recommendationThreshold, nextTaste = taste) => {
    setIsLoadingRecommendations(true);
    setSeedMovie(movie);
    return getRecommendationsFromApi(movie, userId, threshold, nextTaste)
      .then((recs) => {
        setRecommendations(recs);
        setApiError("");
      })
      .catch(() => {
        const localMovie = MOVIES.find((item) => item.id === movie.id);
        const recs = localMovie
          ? getRecommendations(localMovie, MOVIES, nextTaste, 48)
              .map((rec) => ({ ...rec, score: Math.round(rec.score * 100) }))
              .filter((rec) => rec.score >= threshold)
          : [];
        setRecommendations(recs);
        setApiError(t.apiRecommendationFallback);
      })
      .finally(() => setIsLoadingRecommendations(false));
  };

  const handleMovieClick = (movie: Movie) => {
    setDetailMovie(movie);
    loadRecommendations(movie);
  };

  const clearFilters = () => {
    setFilterGenre("");
    setFilterCountry("");
    setFilterMinYear(1970);
    setFilterMaxYear(CURRENT_YEAR);
    setFilterMinRating(0);
    setFilterActor("");
    setFilterDirector("");
  };

  const saveTaste = () => {
    setTaste(tasteDraft);
    window.localStorage.setItem(STORAGE_KEYS.taste, JSON.stringify(tasteDraft));
    setSaveStatus(t.saved);
    if (seedMovie) {
      loadRecommendations(seedMovie, recommendationThreshold, tasteDraft);
    }
    window.setTimeout(() => setSaveStatus(""), 1400);
  };

  const resetTaste = () => {
    setTasteDraft(DEFAULT_USER_TASTE);
    setTaste(DEFAULT_USER_TASTE);
    window.localStorage.setItem(STORAGE_KEYS.taste, JSON.stringify(DEFAULT_USER_TASTE));
  };

  const navItems: Array<{ id: AppTab; label: string; icon: LucideIcon }> = [
    { id: "explore", label: t.explore, icon: Search },
    { id: "taste", label: t.taste, icon: Heart },
    { id: "recommendations", label: t.recommendations, icon: Sparkles },
    { id: "profile", label: t.profile, icon: Settings },
  ];

  return (
    <div className="min-h-screen cine-app-shell">
      <div className="mx-auto flex w-full max-w-[1600px] flex-row">
        <aside className={`cine-sidebar sticky top-0 h-screen ${sidebarCollapsed ? "cine-sidebar-collapsed" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, #E11D48, #F97316)" }}>
                <Film className="h-5 w-5 text-white" />
              </div>
              <div className={sidebarCollapsed ? "hidden" : "hidden sm:block"}>
                <div style={{ color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: 900 }}>CineGraph</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.73rem", fontWeight: 700, textTransform: "uppercase" }}>{t.brandTag}</div>
              </div>
            </div>
            <button
              className="cine-icon-button cine-sidebar-toggle"
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              aria-label={sidebarCollapsed ? t.expandSidebar : t.collapseSidebar}
              title={sidebarCollapsed ? t.expandSidebar : t.collapseSidebar}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          <nav className="mt-7 flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className="cine-tab-button"
                  style={{
                    color: active ? "white" : "var(--text-secondary)",
                    background: active ? "linear-gradient(135deg, #E11D48, #F97316)" : "transparent",
                    borderColor: active ? "transparent" : "var(--border-soft)",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span className={sidebarCollapsed ? "hidden" : "hidden sm:inline"}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className={sidebarCollapsed ? "hidden" : "mt-auto hidden space-y-4 pt-8 sm:block"}>
            <div className="rounded-lg p-3" style={{ background: "var(--surface-muted)", border: "1px solid var(--border-soft)" }}>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" style={{ color: "var(--accent)" }} />
                <span className="truncate" style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 800 }}>{profile.name}</span>
              </div>
              <div className="mt-1 truncate" style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{profile.email}</div>
            </div>
            <button className="cine-secondary-button w-full justify-center" type="button" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              {t.logout}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-3 py-5 sm:px-6 lg:px-8 lg:py-8">
          {apiError && (
            <div className="mb-5 rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.22)", color: "var(--warning-text)" }}>
              {apiError}
            </div>
          )}

          {activeTab === "explore" && (
            <div className="space-y-8">
              <section className="cine-panel p-4 sm:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-4 py-3" style={{ background: "var(--surface-input)", border: "1px solid var(--border-soft)" }}>
                    <Search className="h-5 w-5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                      style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}
                    />
                    {query && (
                      <button className="cine-icon-button" type="button" onClick={() => setQuery("")} aria-label="Clear search">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button className="cine-secondary-button justify-center" type="button" onClick={() => setShowFilters((value) => !value)}>
                    <SlidersHorizontal className="h-4 w-4" />
                    {t.filters}
                  </button>
                </div>

                {showFilters && (
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <FilterSelect label={t.genre} value={filterGenre} onChange={setFilterGenre} options={ALL_GENRES} emptyLabel={t.allGenres} />
                    <FilterSelect label={t.country} value={filterCountry} onChange={setFilterCountry} options={ALL_COUNTRIES} emptyLabel={t.allCountries} />
                    <FilterSelect label={t.director} value={filterDirector} onChange={setFilterDirector} options={ALL_DIRECTORS} emptyLabel={t.allDirectors} />
                    <FilterSelect label={t.rating} value={String(filterMinRating)} onChange={(value) => setFilterMinRating(Number(value))} options={RATING_OPTIONS.map(String)} emptyLabel={t.anyRating} />
                    <FilterInput label={t.actor} value={filterActor} onChange={setFilterActor} placeholder="Leonardo DiCaprio" />
                    <FilterInput label={t.minYear} value={String(filterMinYear)} onChange={(value) => setFilterMinYear(Number(value))} type="number" />
                    <FilterInput label={t.maxYear} value={String(filterMaxYear)} onChange={(value) => setFilterMaxYear(Number(value))} type="number" />
                    <div className="flex items-end">
                      <button className="cine-secondary-button w-full justify-center" type="button" onClick={clearFilters} disabled={!hasActiveFilters}>
                        <RotateCcw className="h-4 w-4" />
                        {t.clear}
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {hasSearched ? (
                <section className="space-y-7">
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5" style={{ color: "var(--accent)" }} />
                    <h1 style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 900 }}>{t.searchResults}</h1>
                    <span className="rounded-full px-2 py-0.5" style={{ background: "var(--surface-muted)", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 800 }}>
                      {isSearching ? t.searching : formatSearchMeta(results.length, t.found, searchTimeMs)}
                    </span>
                  </div>
                  {isSearching ? (
                    <LoadingState text={t.searching} />
                  ) : groupedSearchResults.length === 0 ? (
                    <EmptyState text={t.noMovies} />
                  ) : (
                    groupedSearchResults.map((group) => (
                      <MovieShelf
                        key={group.key}
                        title={group.title}
                        results={group.items}
                        onMovieClick={handleMovieClick}
                        language={language}
                        emptyText={t.noMovies}
                      />
                    ))
                  )}
                </section>
              ) : (
                isLoadingCatalog ? (
                  <LoadingState text={t.searching} />
                ) : (
                  <section className="space-y-8">
                    <MovieShelf
                      title={t.defaultTitle}
                      hint={t.defaultHint}
                      results={recentMovies}
                      onMovieClick={handleMovieClick}
                      language={language}
                      emptyText={t.noMovies}
                    />
                    <MovieShelf
                      title={t.topRated}
                      results={topRatedMovies}
                      onMovieClick={handleMovieClick}
                      language={language}
                      emptyText={t.noMovies}
                    />
                  </section>
                )
              )}
            </div>
          )}

          {activeTab === "taste" && (
            <TastePanel
              language={language}
              tasteDraft={tasteDraft}
              setTasteDraft={setTasteDraft}
              onSave={saveTaste}
              onReset={resetTaste}
              saveStatus={saveStatus}
            />
          )}

          {activeTab === "recommendations" && (
            <div className="space-y-8">
              <RecommendationPanel
                title={t.recommendationTitle}
                hint={seedMovie ? `${t.recommendationHint} ${seedMovie.title}` : t.recommendationHint}
                seedMovie={seedMovie}
                recommendations={seedMovie ? recommendations : tasteRecommendations}
                threshold={recommendationThreshold}
                onThresholdChange={(value) => {
                  setRecommendationThreshold(value);
                  if (seedMovie) loadRecommendations(seedMovie, value);
                }}
                loading={isLoadingRecommendations}
                language={language}
                onMovieClick={handleMovieClick}
                emptyText={t.noMovies}
              />
            </div>
          )}

          {activeTab === "profile" && (
            <ProfilePanel
              language={language}
              theme={theme}
              profile={profile}
              setLanguage={setLanguage}
              setTheme={setTheme}
              setProfile={setProfile}
              onEditTaste={() => setActiveTab("taste")}
            />
          )}
        </main>
      </div>

      <MovieModal movie={detailMovie} onClose={() => setDetailMovie(null)} />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  emptyLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  emptyLabel: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{label}</span>
      <select className="cine-field" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{label}</span>
      <input className="cine-field" type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} min={type === "number" ? 1900 : undefined} max={type === "number" ? CURRENT_YEAR : undefined} />
    </label>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="rounded-lg px-4 py-16 text-center" style={{ color: "var(--text-muted)", border: "1px solid var(--border-soft)", background: "var(--surface-card)" }}>
      <Film className="mx-auto mb-3 h-10 w-10 opacity-45" />
      {text}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg px-4 py-16 text-center" style={{ color: "var(--text-muted)", border: "1px solid var(--border-soft)", background: "var(--surface-card)" }}>
      <Film className="mx-auto mb-3 h-10 w-10 opacity-45" />
      {text}
    </div>
  );
}

function TastePanel({
  language,
  tasteDraft,
  setTasteDraft,
  onSave,
  onReset,
  saveStatus,
}: {
  language: Language;
  tasteDraft: UserTaste;
  setTasteDraft: (taste: UserTaste) => void;
  onSave: () => void;
  onReset: () => void;
  saveStatus: string;
}) {
  const t = COPY[language];
  const countryOptions = ["Vietnam", "United States", "South Korea", "Japan", "France", "China", "Thailand", "Singapore"];

  return (
    <section className="cine-panel max-w-5xl p-5 sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Heart className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <h1 style={{ color: "var(--text-primary)", fontSize: "1.35rem", fontWeight: 900 }}>{t.askTitle}</h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t.askIntro}</p>
        </div>
        {saveStatus && <span className="rounded-full px-3 py-1 text-sm font-bold text-green-300" style={{ background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.28)" }}>{saveStatus}</span>}
      </div>

      <div className="space-y-7">
        <div>
          <h2 className="mb-3" style={{ color: "var(--text-primary)", fontWeight: 850 }}>{t.preferredGenres}</h2>
          <ChipPicker
            items={ALL_GENRES}
            selected={tasteDraft.genres}
            onToggle={(genre) => setTasteDraft({ ...tasteDraft, genres: toggleArrayValue(tasteDraft.genres, genre) })}
          />
        </div>

        <div>
          <h2 className="mb-3" style={{ color: "var(--text-primary)", fontWeight: 850 }}>{t.preferredCountries}</h2>
          <ChipPicker
            items={countryOptions}
            selected={tasteDraft.countries}
            onToggle={(country) => setTasteDraft({ ...tasteDraft, countries: toggleArrayValue(tasteDraft.countries, country) })}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <TextListField label={t.preferredActors} values={tasteDraft.actors} onChange={(actors) => setTasteDraft({ ...tasteDraft, actors })} placeholder="Song Kang-ho, Leonardo DiCaprio" />
          <TextListField label={t.preferredDirectors} values={tasteDraft.directors} onChange={(directors) => setTasteDraft({ ...tasteDraft, directors })} placeholder="Victor Vu, Christopher Nolan" />
          <TextListField label={t.preferredKeywords} values={tasteDraft.keywords} onChange={(keywords) => setTasteDraft({ ...tasteDraft, keywords })} placeholder="family, mystery, war" />
        </div>

        <div>
          <h2 className="mb-4" style={{ color: "var(--text-primary)", fontWeight: 850 }}>{t.weights}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <PreferenceSlider label={t.genre} value={tasteDraft.genreWeight} onChange={(genreWeight) => setTasteDraft({ ...tasteDraft, genreWeight })} />
            <PreferenceSlider label={t.country} value={tasteDraft.countryWeight} onChange={(countryWeight) => setTasteDraft({ ...tasteDraft, countryWeight })} />
            <PreferenceSlider label={t.actor} value={tasteDraft.actorWeight} onChange={(actorWeight) => setTasteDraft({ ...tasteDraft, actorWeight })} />
            <PreferenceSlider label={t.director} value={tasteDraft.directorWeight} onChange={(directorWeight) => setTasteDraft({ ...tasteDraft, directorWeight })} />
            <PreferenceSlider label="Keyword" value={tasteDraft.keywordWeight} onChange={(keywordWeight) => setTasteDraft({ ...tasteDraft, keywordWeight })} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="cine-primary-button" type="button" onClick={onSave}>
            <Save className="h-4 w-4" />
            {t.saveTaste}
          </button>
          <button className="cine-secondary-button" type="button" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            {t.resetTaste}
          </button>
        </div>
      </div>
    </section>
  );
}

function TextListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <input className="cine-field" value={values.join(", ")} onChange={(event) => onChange(splitCsv(event.target.value))} placeholder={placeholder} />
    </label>
  );
}

function RecommendationPanel({
  title,
  hint,
  seedMovie,
  recommendations,
  threshold,
  onThresholdChange,
  loading,
  language,
  onMovieClick,
  emptyText,
}: {
  title: string;
  hint: string;
  seedMovie: Movie | null;
  recommendations: Recommendation[];
  threshold: number;
  onThresholdChange: (value: number) => void;
  loading: boolean;
  language: Language;
  onMovieClick: (movie: Movie) => void;
  emptyText: string;
}) {
  const t = COPY[language];

  return (
    <section className="cine-panel p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(225,29,72,0.15)", color: "var(--accent)" }}>
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 900 }}>{title}</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{hint}</p>
          </div>
        </div>

        <div className="min-w-[260px]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{t.threshold}</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 900 }}>{threshold}</span>
          </div>
          <input
            className="cine-range"
            type="range"
            min={0}
            max={100}
            step={5}
            value={threshold}
            style={{ "--range-progress": `${threshold}%` } as CSSProperties}
            onChange={(event) => onThresholdChange(Number(event.target.value))}
            disabled={!seedMovie}
          />
          <div className="mt-1 flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
            <span>{t.broad}</span>
            <span>{t.strict}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState text="Finding graph matches..." />
      ) : (
        <MovieShelf
          title={seedMovie ? seedMovie.title : t.defaultTitle}
          results={recommendations}
          onMovieClick={onMovieClick}
          language={language}
          emptyText={emptyText}
        />
      )}
    </section>
  );
}

function ProfilePanel({
  language,
  theme,
  profile,
  setLanguage,
  setTheme,
  setProfile,
  onEditTaste,
}: {
  language: Language;
  theme: ThemeMode;
  profile: UserProfile;
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  setProfile: (profile: UserProfile) => void;
  onEditTaste: () => void;
}) {
  const t = COPY[language];

  return (
    <section className="cine-panel max-w-4xl p-5 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <Settings className="h-5 w-5" style={{ color: "var(--accent)" }} />
        <h1 style={{ color: "var(--text-primary)", fontSize: "1.35rem", fontWeight: 900 }}>{t.profileTitle}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <h2 style={{ color: "var(--text-primary)", fontWeight: 850 }}>{t.personalInfo}</h2>
          <FilterInput label={t.displayName} value={profile.name} onChange={(name) => setProfile({ ...profile, name })} />
          <FilterInput label={t.email} value={profile.email} onChange={(email) => setProfile({ ...profile, email })} type="email" />
          <FilterInput label={t.city} value={profile.city} onChange={(city) => setProfile({ ...profile, city })} />
        </div>

        <div className="space-y-5">
          <div>
            <h2 className="mb-3" style={{ color: "var(--text-primary)", fontWeight: 850 }}>{t.appearance}</h2>
            <div className="grid grid-cols-2 gap-2">
              <SegmentButton active={theme === "dark"} onClick={() => setTheme("dark")} icon={<Moon className="h-4 w-4" />} label="Dark" />
              <SegmentButton active={theme === "light"} onClick={() => setTheme("light")} icon={<Sun className="h-4 w-4" />} label="Light" />
            </div>
          </div>

          <div>
            <h2 className="mb-3" style={{ color: "var(--text-primary)", fontWeight: 850 }}>{t.language}</h2>
            <div className="grid grid-cols-2 gap-2">
              <SegmentButton active={language === "vi"} onClick={() => setLanguage("vi")} icon={<Globe2 className="h-4 w-4" />} label="VI" />
              <SegmentButton active={language === "en"} onClick={() => setLanguage("en")} icon={<Globe2 className="h-4 w-4" />} label="EN" />
            </div>
          </div>

          <button className="cine-primary-button w-full justify-center" type="button" onClick={onEditTaste}>
            <Heart className="h-4 w-4" />
            {t.updateTaste}
          </button>
        </div>
      </div>
    </section>
  );
}

function SegmentButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      className="cine-secondary-button justify-center"
      type="button"
      onClick={onClick}
      style={{
        color: active ? "white" : "var(--text-secondary)",
        background: active ? "linear-gradient(135deg, #E11D48, #F97316)" : "var(--surface-muted)",
        borderColor: active ? "transparent" : "var(--border-soft)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
