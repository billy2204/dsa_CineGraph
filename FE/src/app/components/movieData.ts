export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  rating: number;
  genres: string[];
  actors: string[];
  director: string;
  keywords: string[];
  description: string;
  poster: string;
  duration: number;
  countries?: string[];
  languages?: string[];
}

export interface GraphNode {
  id: string;
  type: "movie" | "genre" | "actor" | "director" | "keyword";
  label: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export const MOVIES: Movie[] = [
  {
    id: "m1",
    title: "Inception",
    year: 2010,
    rating: 8.8,
    genres: ["Sci-Fi", "Thriller", "Action"],
    actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page", "Tom Hardy"],
    director: "Christopher Nolan",
    keywords: ["dreams", "heist", "mind", "reality", "subconscious"],
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 148,
  },
  {
    id: "m2",
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0,
    genres: ["Action", "Crime", "Drama"],
    actors: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Maggie Gyllenhaal"],
    director: "Christopher Nolan",
    keywords: ["batman", "joker", "chaos", "vigilante", "Gotham"],
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    poster: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 152,
  },
  {
    id: "m3",
    title: "Interstellar",
    year: 2014,
    rating: 8.6,
    genres: ["Sci-Fi", "Drama", "Adventure"],
    actors: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Matt Damon"],
    director: "Christopher Nolan",
    keywords: ["space", "time", "gravity", "wormhole", "future"],
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 169,
  },
  {
    id: "m4",
    title: "Parasite",
    year: 2019,
    rating: 8.5,
    genres: ["Thriller", "Drama", "Comedy"],
    actors: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
    director: "Bong Joon-ho",
    keywords: ["class", "poverty", "inequality", "deception", "family"],
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    poster: "https://images.unsplash.com/photo-1665314567748-37ac2ac92738?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 132,
  },
  {
    id: "m5",
    title: "The Shawshank Redemption",
    year: 1994,
    rating: 9.3,
    genres: ["Drama"],
    actors: ["Tim Robbins", "Morgan Freeman", "Bob Gunton", "William Sadler"],
    director: "Frank Darabont",
    keywords: ["prison", "hope", "friendship", "freedom", "redemption"],
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    poster: "https://images.unsplash.com/photo-1549144277-47d96d572dc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 142,
  },
  {
    id: "m6",
    title: "Pulp Fiction",
    year: 1994,
    rating: 8.9,
    genres: ["Crime", "Drama", "Thriller"],
    actors: ["John Travolta", "Uma Thurman", "Samuel L. Jackson", "Bruce Willis"],
    director: "Quentin Tarantino",
    keywords: ["crime", "nonlinear", "dialogue", "violence", "hitmen"],
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    poster: "https://images.unsplash.com/photo-1629510254000-10f3afc69c55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 154,
  },
  {
    id: "m7",
    title: "The Matrix",
    year: 1999,
    rating: 8.7,
    genres: ["Sci-Fi", "Action"],
    actors: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss", "Hugo Weaving"],
    director: "Lana Wachowski",
    keywords: ["simulation", "reality", "hacker", "AI", "dystopia"],
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    poster: "https://images.unsplash.com/photo-1701275998609-119e2c09f443?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 136,
  },
  {
    id: "m8",
    title: "Forrest Gump",
    year: 1994,
    rating: 8.8,
    genres: ["Drama", "Romance"],
    actors: ["Tom Hanks", "Robin Wright", "Gary Sinise", "Sally Field"],
    director: "Robert Zemeckis",
    keywords: ["history", "journey", "love", "destiny", "simple"],
    description: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man.",
    poster: "https://images.unsplash.com/photo-1628406690081-9755572fcd77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 142,
  },
  {
    id: "m9",
    title: "Avengers: Endgame",
    year: 2019,
    rating: 8.4,
    genres: ["Action", "Adventure", "Sci-Fi"],
    actors: ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson", "Mark Ruffalo"],
    director: "Anthony Russo",
    keywords: ["superhero", "time travel", "sacrifice", "universe", "infinity"],
    description: "After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
    poster: "https://images.unsplash.com/photo-1620153850780-0883dd907257?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 181,
  },
  {
    id: "m10",
    title: "The Silence of the Lambs",
    year: 1991,
    rating: 8.6,
    genres: ["Crime", "Drama", "Thriller"],
    actors: ["Jodie Foster", "Anthony Hopkins", "Scott Glenn", "Ted Levine"],
    director: "Jonathan Demme",
    keywords: ["serial killer", "FBI", "psychology", "horror", "cat-and-mouse"],
    description: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.",
    poster: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 118,
  },
  {
    id: "m11",
    title: "Whiplash",
    year: 2014,
    rating: 8.5,
    genres: ["Drama", "Music"],
    actors: ["Miles Teller", "J.K. Simmons", "Paul Reiser", "Melissa Benoist"],
    director: "Damien Chazelle",
    keywords: ["music", "ambition", "perfectionism", "jazz", "obsession"],
    description: "A promising young drummer enrolls at a cutthroat music conservatory where his dreams of greatness are mentored by an abusive instructor.",
    poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 107,
  },
  {
    id: "m12",
    title: "Joker",
    year: 2019,
    rating: 8.4,
    genres: ["Crime", "Drama", "Thriller"],
    actors: ["Joaquin Phoenix", "Robert De Niro", "Zazie Beetz", "Frances Conroy"],
    director: "Todd Phillips",
    keywords: ["mental illness", "society", "violence", "origin", "chaos"],
    description: "A socially marginalized comedian develops a nihilistic worldview and descends into madness, becoming the iconic villain known as the Joker.",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 122,
  },
  {
    id: "m13",
    title: "La La Land",
    year: 2016,
    rating: 8.0,
    genres: ["Drama", "Music", "Romance"],
    actors: ["Ryan Gosling", "Emma Stone", "John Legend", "Rosemarie DeWitt"],
    director: "Damien Chazelle",
    keywords: ["music", "dreams", "love", "jazz", "Hollywood"],
    description: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 128,
  },
  {
    id: "m14",
    title: "Mad Max: Fury Road",
    year: 2015,
    rating: 8.1,
    genres: ["Action", "Adventure", "Sci-Fi"],
    actors: ["Tom Hardy", "Charlize Theron", "Nicholas Hoult", "Hugh Keays-Byrne"],
    director: "George Miller",
    keywords: ["apocalypse", "chase", "desert", "survival", "rebellion"],
    description: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners.",
    poster: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 120,
  },
  {
    id: "m15",
    title: "Spirited Away",
    year: 2001,
    rating: 8.6,
    genres: ["Animation", "Adventure", "Family"],
    actors: ["Daveigh Chase", "Suzanne Pleshette", "Miyu Irino", "Rumi Hiiragi"],
    director: "Hayao Miyazaki",
    keywords: ["fantasy", "spirit", "journey", "magic", "coming-of-age"],
    description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.",
    poster: "https://images.unsplash.com/photo-1665314567748-37ac2ac92738?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 125,
  },
  {
    id: "m16",
    title: "The Godfather",
    year: 1972,
    rating: 9.2,
    genres: ["Crime", "Drama"],
    actors: ["Marlon Brando", "Al Pacino", "James Caan", "Diane Keaton"],
    director: "Francis Ford Coppola",
    keywords: ["mafia", "family", "power", "loyalty", "crime"],
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    poster: "https://images.unsplash.com/photo-1549144277-47d96d572dc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 175,
  },
  {
    id: "m17",
    title: "Schindler's List",
    year: 1993,
    rating: 8.9,
    genres: ["Biography", "Drama", "History"],
    actors: ["Liam Neeson", "Ben Kingsley", "Ralph Fiennes", "Caroline Goodall"],
    director: "Steven Spielberg",
    keywords: ["Holocaust", "war", "humanity", "rescue", "history"],
    description: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution.",
    poster: "https://images.unsplash.com/photo-1629510254000-10f3afc69c55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 195,
  },
  {
    id: "m18",
    title: "Get Out",
    year: 2017,
    rating: 7.7,
    genres: ["Horror", "Mystery", "Thriller"],
    actors: ["Daniel Kaluuya", "Allison Williams", "Bradley Whitford", "Catherine Keener"],
    director: "Jordan Peele",
    keywords: ["racism", "hypnosis", "horror", "social", "suspense"],
    description: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.",
    poster: "https://images.unsplash.com/photo-1701275998609-119e2c09f443?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 104,
  },
  {
    id: "m19",
    title: "Everything Everywhere All at Once",
    year: 2022,
    rating: 7.8,
    genres: ["Action", "Adventure", "Comedy"],
    actors: ["Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan", "Jamie Lee Curtis"],
    director: "Daniel Kwan",
    keywords: ["multiverse", "family", "identity", "chaos", "absurd"],
    description: "An aging Chinese immigrant is swept up in an insane adventure in which she alone can save the world by exploring other universes connecting with the lives she could have led.",
    poster: "https://images.unsplash.com/photo-1628406690081-9755572fcd77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 139,
  },
  {
    id: "m20",
    title: "Dune",
    year: 2021,
    rating: 8.0,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    actors: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Zendaya"],
    director: "Denis Villeneuve",
    keywords: ["desert", "prophecy", "politics", "spice", "future"],
    description: "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset while its heir becomes troubled by visions of a dark future.",
    poster: "https://images.unsplash.com/photo-1620153850780-0883dd907257?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    duration: 155,
  },
];

const LOCAL_MOVIE_COUNTRIES: Record<string, string[]> = {
  m1: ["United States"],
  m2: ["United States", "United Kingdom"],
  m3: ["United States", "United Kingdom"],
  m4: ["South Korea"],
  m5: ["United States"],
  m6: ["United States"],
  m7: ["United States", "Australia"],
  m8: ["United States"],
  m9: ["United States"],
  m10: ["United States"],
  m11: ["United States"],
  m12: ["United States"],
  m13: ["United States"],
  m14: ["Australia", "United States"],
  m15: ["Japan"],
  m16: ["United States"],
  m17: ["United States"],
  m18: ["United States"],
  m19: ["United States"],
  m20: ["United States"],
};

const LOCAL_MOVIE_LANGUAGES: Record<string, string[]> = {
  m4: ["Korean"],
  m15: ["Japanese"],
};

export interface UserTaste {
  genres: string[];
  countries: string[];
  actors: string[];
  directors: string[];
  keywords: string[];
  genreWeight: number;
  countryWeight: number;
  actorWeight: number;
  directorWeight: number;
  keywordWeight: number;
}

export const DEFAULT_USER_TASTE: UserTaste = {
  genres: ["Drama", "Thriller"],
  countries: ["Vietnam", "United States"],
  actors: [],
  directors: [],
  keywords: [],
  genreWeight: 30,
  countryWeight: 20,
  actorWeight: 20,
  directorWeight: 20,
  keywordWeight: 10,
};

export function movieCountries(movie: Movie): string[] {
  return movie.countries?.filter(Boolean) ?? LOCAL_MOVIE_COUNTRIES[movie.id] ?? ["United States"];
}

export function movieLanguages(movie: Movie): string[] {
  return movie.languages?.filter(Boolean) ?? LOCAL_MOVIE_LANGUAGES[movie.id] ?? ["English"];
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function anyMatch(values: string[], preferences: string[]) {
  const normalizedPreferences = preferences.map(normalize).filter(Boolean);
  if (normalizedPreferences.length === 0) return false;
  return values.some((value) => {
    const normalizedValue = normalize(value);
    return normalizedPreferences.some((preference) => normalizedValue.includes(preference) || preference.includes(normalizedValue));
  });
}

function matchRatio(values: string[], preferences: string[]) {
  const normalizedPreferences = preferences.map(normalize).filter(Boolean);
  if (normalizedPreferences.length === 0) return 0;
  const matches = normalizedPreferences.filter((preference) =>
    values.some((value) => {
      const normalizedValue = normalize(value);
      return normalizedValue.includes(preference) || preference.includes(normalizedValue);
    })
  );
  return matches.length / normalizedPreferences.length;
}

export function tasteScore(movie: Movie, taste: UserTaste): number {
  const score =
    taste.genreWeight * matchRatio(movie.genres, taste.genres) +
    taste.countryWeight * matchRatio(movieCountries(movie), taste.countries) +
    taste.actorWeight * matchRatio(movie.actors, taste.actors) +
    taste.directorWeight * matchRatio([movie.director], taste.directors) +
    taste.keywordWeight * matchRatio(movie.keywords, taste.keywords);

  return Math.round(score * 100) / 100;
}

export function tasteReasons(movie: Movie, taste: UserTaste): string[] {
  const reasons: string[] = [];
  if (anyMatch(movie.genres, taste.genres)) reasons.push("Taste genre");
  if (anyMatch(movieCountries(movie), taste.countries)) reasons.push("Taste country");
  if (anyMatch(movie.actors, taste.actors)) reasons.push("Taste actor");
  if (anyMatch([movie.director], taste.directors)) reasons.push("Taste director");
  if (anyMatch(movie.keywords, taste.keywords)) reasons.push("Taste keyword");
  return reasons;
}

export const ALL_GENRES = [...new Set(MOVIES.flatMap((m) => m.genres))].sort();
export const ALL_ACTORS = [...new Set(MOVIES.flatMap((m) => m.actors))].sort();
export const ALL_DIRECTORS = [...new Set(MOVIES.map((m) => m.director))].sort();
export const ALL_COUNTRIES = [...new Set(MOVIES.flatMap((m) => movieCountries(m)).concat(["Vietnam", "United States", "South Korea", "Japan", "France"]))].sort();
export const YEARS = [...new Set(MOVIES.map((m) => m.year))].sort((a, b) => b - a);

// Edge weights for graph similarity
const WEIGHTS = {
  director: 0.5,
  actor: 0.4,
  genre: 0.3,
  keyword: 0.2,
};

export interface SearchFilters {
  genre: string;
  minYear: number;
  maxYear: number;
  minRating: number;
  actor: string;
  director: string;
  country: string;
}

export interface SearchResult {
  movie: Movie;
  score: number;
  matchReasons: string[];
}

export interface Recommendation {
  movie: Movie;
  score: number;
  explanation: string;
}

export function searchMovies(
  query: string,
  filters: Partial<SearchFilters>,
  taste: UserTaste = DEFAULT_USER_TASTE,
  limit = 72
): SearchResult[] {
  const q = query.toLowerCase().trim();

  const scored: SearchResult[] = MOVIES.map((movie) => {
    let score = 0;
    const matchReasons: string[] = [];

    if (q) {
      // BR3: Exact title match gets highest priority
      if (movie.title.toLowerCase() === q) {
        score += 100;
        matchReasons.push("Exact title match");
      } else if (movie.title.toLowerCase().includes(q)) {
        // BR4: Partial keyword matching
        score += 80;
        matchReasons.push("Title match");
      }

      // BR1: Search by actor
      const actorMatch = movie.actors.find((a) => a.toLowerCase().includes(q));
      if (actorMatch) {
        score += 60;
        matchReasons.push(`Actor: ${actorMatch}`);
      }

      // BR1: Search by director
      if (movie.director.toLowerCase().includes(q)) {
        score += 60;
        matchReasons.push(`Director: ${movie.director}`);
      }

      // BR1: Search by genre
      const genreMatch = movie.genres.find((g) => g.toLowerCase().includes(q));
      if (genreMatch) {
        score += 40;
        matchReasons.push(`Genre: ${genreMatch}`);
      }

      // BR1: Search by keywords
      const keywordMatch = movie.keywords.find((k) => k.toLowerCase().includes(q));
      if (keywordMatch) {
        score += 30;
        matchReasons.push(`Keyword: ${keywordMatch}`);
      }

      // BR1: Search by release year
      if (movie.year.toString().includes(q)) {
        score += 20;
        matchReasons.push(`Year: ${movie.year}`);
      }

      // BR1: Rating context
      if (q.match(/^\d+(\.\d+)?$/) && parseFloat(q) <= movie.rating) {
        score += 15;
        matchReasons.push(`Rating: ${movie.rating}`);
      }
    } else {
      score = movie.rating * 10;
    }

    const preferenceScore = tasteScore(movie, taste);
    if (preferenceScore > 0) {
      score += preferenceScore;
      matchReasons.push(...tasteReasons(movie, taste));
    }

    return { movie, score, matchReasons };
  });

  let results = scored.filter((r) => {
    if (q && r.score === 0) return false;

    // BR5: Apply filters
    if (filters.genre && !r.movie.genres.includes(filters.genre)) return false;
    if (filters.minYear && r.movie.year < filters.minYear) return false;
    if (filters.maxYear && r.movie.year > filters.maxYear) return false;
    if (filters.minRating && r.movie.rating < filters.minRating) return false;
    if (filters.actor && !r.movie.actors.some((a) => a.toLowerCase().includes(filters.actor!.toLowerCase()))) return false;
    if (filters.director && !r.movie.director.toLowerCase().includes(filters.director.toLowerCase())) return false;
    if (filters.country && !movieCountries(r.movie).some((country) => country.toLowerCase().includes(filters.country!.toLowerCase()))) return false;

    return true;
  });

  // BR2: Rank by relevance score
  results.sort((a, b) => b.score - a.score);

  // BR15: Limit results
  return results.slice(0, limit);
}

// BR6-BR10: Graph-based recommendation engine
export function getRecommendations(sourceMovie: Movie, allMovies: Movie[], taste: UserTaste = DEFAULT_USER_TASTE, limit = 12): Recommendation[] {
  const candidates = allMovies.filter((m) => m.id !== sourceMovie.id); // BR11

  const scored = candidates.map((movie) => {
    let score = 0;
    const reasons: string[] = [];

    // BR9: Different weights for different relationship types
    // BR8: Calculate similarity based on shared graph connections

    // Same director (highest weight)
    if (movie.director === sourceMovie.director) {
      score += WEIGHTS.director;
      reasons.push(`Same director (${movie.director})`);
    }

    // Shared actors
    const sharedActors = movie.actors.filter((a) => sourceMovie.actors.includes(a));
    if (sharedActors.length > 0) {
      score += WEIGHTS.actor * Math.min(sharedActors.length, 3) / 3;
      reasons.push(`Stars ${sharedActors.slice(0, 2).join(", ")}`);
    }

    // Shared genres
    const sharedGenres = movie.genres.filter((g) => sourceMovie.genres.includes(g));
    if (sharedGenres.length > 0) {
      score += WEIGHTS.genre * (sharedGenres.length / Math.max(movie.genres.length, sourceMovie.genres.length));
      reasons.push(`Similar genre: ${sharedGenres.join(", ")}`);
    }

    // Shared keywords
    const sharedKeywords = movie.keywords.filter((k) => sourceMovie.keywords.includes(k));
    if (sharedKeywords.length > 0) {
      score += WEIGHTS.keyword * (sharedKeywords.length / Math.max(movie.keywords.length, sourceMovie.keywords.length));
      reasons.push(`Shares themes: ${sharedKeywords.slice(0, 2).join(", ")}`);
    }

    const topReason = reasons[0] || "Similar style";
    const explanation = `${topReason}${reasons.length > 1 ? ` and ${reasons.length - 1} more connection${reasons.length > 2 ? "s" : ""}` : ""}`;
    score += tasteScore(movie, taste) / 100;

    return { movie, score, explanation };
  });

  // BR12: Remove duplicates already handled by unique movie IDs
  // BR13: Sort by recommendation score
  const sorted = scored.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);

  // BR14: Explanation is already set above
  // BR15: Limit recommendations
  return sorted.slice(0, limit);
}

export function getTasteRecommendations(allMovies: Movie[], taste: UserTaste, limit = 24): Recommendation[] {
  return [...allMovies]
    .map((movie) => {
      const score = tasteScore(movie, taste);
      return {
        movie,
        score,
        explanation: tasteReasons(movie, taste).join(", ") || "Ranked by rating and trend",
      };
    })
    .filter((recommendation) => recommendation.score > 0)
    .sort((a, b) => b.score - a.score || b.movie.rating - a.movie.rating)
    .slice(0, limit);
}
