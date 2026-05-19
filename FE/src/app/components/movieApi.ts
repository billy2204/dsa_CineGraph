import { Movie, Recommendation, SearchFilters, SearchResult, UserTaste } from "./movieData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80";

interface ApiMovie {
  id?: string;
  movie_id?: string;
  title?: string;
  original_title?: string;
  originalTitle?: string;
  year?: number;
  release_year?: number;
  rating?: number;
  vote_average?: number;
  genres?: string[];
  actors?: string[];
  director?: string;
  keywords?: string[];
  countries?: string[];
  languages?: string[];
  description?: string;
  poster?: string;
  poster_url?: string;
  duration?: number;
  runtime_minutes?: number;
}

interface ApiSearchItem {
  movie: ApiMovie;
  score?: number;
  search_score?: number;
  match_reasons?: string[];
  matchReasons?: string[];
}

interface ApiRecommendationItem {
  movie?: ApiMovie;
  score?: number;
  normalized_final_recommendation_score?: number;
  explanation?: string;
  reasons?: string[];
}

interface ApiSearchResponse {
  items?: ApiSearchItem[];
  count?: number;
  search_time_ms?: number;
  searchTimeMs?: number;
}

function userIdParam(userId: string) {
  return userId ? { user_id: userId } : {};
}

function buildUrl(path: string, params: Record<string, string | number | undefined>) {
  const url = new URL(path, API_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

function normalizedRating(value: unknown) {
  const rating = Number(value ?? 0);
  if (!Number.isFinite(rating) || rating <= 0) {
    return 0.1;
  }
  return Math.max(0.1, Math.min(10, rating > 10 && rating <= 100 ? rating / 10 : rating));
}

function toMovie(apiMovie: ApiMovie): Movie {
  return {
    id: apiMovie.id ?? apiMovie.movie_id ?? "",
    title: apiMovie.title ?? "Untitled",
    originalTitle: apiMovie.originalTitle ?? apiMovie.original_title,
    year: apiMovie.year ?? apiMovie.release_year ?? 0,
    rating: normalizedRating(apiMovie.rating ?? apiMovie.vote_average),
    genres: apiMovie.genres ?? [],
    actors: apiMovie.actors ?? [],
    director: apiMovie.director ?? "Unknown",
    keywords: apiMovie.keywords ?? [],
    countries: apiMovie.countries ?? [],
    languages: apiMovie.languages ?? [],
    description: apiMovie.description ?? "No description available.",
    poster: apiMovie.poster ?? apiMovie.poster_url ?? FALLBACK_POSTER,
    duration: apiMovie.duration ?? apiMovie.runtime_minutes ?? 0,
  };
}

function preferenceParams(taste?: UserTaste) {
  if (!taste) return {};
  return {
    preferred_genres: taste.genres.join(","),
    preferred_countries: taste.countries.join(","),
    preferred_actors: taste.actors.join(","),
    preferred_directors: taste.directors.join(","),
    preferred_keywords: taste.keywords.join(","),
    genre_weight: taste.genreWeight,
    country_weight: taste.countryWeight,
    actor_weight: taste.actorWeight,
    director_weight: taste.directorWeight,
    keyword_weight: taste.keywordWeight,
  };
}

async function readJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

export async function searchMoviesFromApi(
  query: string,
  filters: Partial<SearchFilters>,
  userId: string,
  taste?: UserTaste,
  signal?: AbortSignal
): Promise<{ items: SearchResult[]; count: number; searchTimeMs?: number }> {
  const data = await readJson<ApiSearchResponse>(
    buildUrl("/api/search", {
      q: query,
      genre: filters.genre,
      minYear: filters.minYear,
      maxYear: filters.maxYear,
      minRating: filters.minRating,
      actor: filters.actor,
      director: filters.director,
      country: filters.country,
      limit: 72,
      ...userIdParam(userId),
      ...preferenceParams(taste),
    }),
    signal
  );

  const items = (data.items ?? []).map((item) => ({
    movie: toMovie(item.movie),
    score: Number(item.score ?? item.search_score ?? 0),
    matchReasons: item.match_reasons ?? item.matchReasons ?? [],
  }));

  const rawTime = Number(data.search_time_ms ?? data.searchTimeMs);
  const searchTimeMs = Number.isFinite(rawTime) ? Math.max(0, Math.round(rawTime)) : undefined;

  return {
    items,
    count: Number.isFinite(Number(data.count)) ? Number(data.count) : items.length,
    searchTimeMs,
  };
}

export async function getMoviesFromApi(limit = 72, offset = 0, signal?: AbortSignal): Promise<Movie[]> {
  const data = await readJson<{ items: ApiMovie[] }>(
    buildUrl("/api/movies", {
      limit,
      offset,
    }),
    signal
  );

  return (data.items ?? []).map(toMovie);
}

export async function getRecommendationsFromApi(
  movie: Movie,
  userId: string,
  threshold: number,
  taste?: UserTaste,
  signal?: AbortSignal
): Promise<Recommendation[]> {
  const data = await readJson<{ items: ApiRecommendationItem[] }>(
    buildUrl("/api/recommendations", {
      seed_movie_id: movie.id,
      threshold,
      limit: 48,
      ...userIdParam(userId),
      ...preferenceParams(taste),
    }),
    signal
  );

  return (data.items ?? [])
    .filter((item) => item.movie)
    .map((item) => ({
      movie: toMovie(item.movie!),
      score: Number(item.score ?? item.normalized_final_recommendation_score ?? 0),
      explanation: item.explanation ?? item.reasons?.[0] ?? "Related by graph connections",
    }));
}
