import { Star, Clock, ChevronRight, MapPin } from "lucide-react";
import { Movie, movieCountries } from "./movieData";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface MovieCardProps {
  movie: Movie;
  score?: number;
  matchReasons?: string[];
  recommendationExplanation?: string;
  onClick: (movie: Movie) => void;
  compact?: boolean;
}

export function MovieCard({ movie, score, matchReasons, recommendationExplanation, onClick, compact }: MovieCardProps) {
  const rating = Number.isFinite(movie.rating) && movie.rating > 0 ? movie.rating : 0.1;
  const scoreColor = rating >= 8.5 ? "#22C55E" : rating >= 7.5 ? "#F59E0B" : "#FF6B35";
  const showOriginalTitle = movie.originalTitle && movie.originalTitle !== movie.title;
  const countries = movieCountries(movie);
  const visibleGenres = movie.genres.length > 0 ? movie.genres.slice(0, 2) : countries.slice(0, 1);

  return (
    <div
      onClick={() => onClick(movie)}
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 cine-movie-card"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--shadow-card)",
        borderRadius: 8,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "rgba(255,45,85,0.45)";
        e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border-soft)";
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
    >
      {/* Poster */}
      <div className={`relative overflow-hidden ${compact ? "h-40" : "h-52"}`}>
        <ImageWithFallback
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)" }} />

        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <Star className="w-3 h-3" style={{ color: scoreColor, fill: scoreColor }} />
          <span className="text-white" style={{ fontSize: "0.75rem", fontWeight: "700" }}>{rating.toFixed(1)}</span>
        </div>

        {/* Genres overlay */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          {visibleGenres.map((g) => (
            <span
              key={g}
              className="px-2 py-0.5 rounded-full text-white"
              style={{ fontSize: "0.65rem", fontWeight: "700", background: "rgba(190,18,60,0.72)", backdropFilter: "blur(8px)" }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="mb-1 line-clamp-2 min-h-[2.35rem]" style={{ color: "var(--text-primary)", fontSize: compact ? "0.86rem" : "0.98rem", fontWeight: "800", lineHeight: "1.18" }}>
          {movie.title}
        </h3>
        {showOriginalTitle && (
          <div className="line-clamp-1 mb-1" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
            {movie.originalTitle}
          </div>
        )}
        <div className="flex items-center gap-2 mb-2 min-w-0" style={{ color: "var(--text-secondary)" }}>
          <span style={{ fontSize: "0.75rem" }}>{movie.year}</span>
          <span style={{ fontSize: "0.75rem" }}>·</span>
          <Clock className="w-3 h-3" />
          <span style={{ fontSize: "0.75rem" }}>{movie.duration}m</span>
          <span style={{ fontSize: "0.75rem" }}>·</span>
          <span style={{ fontSize: "0.75rem" }} className="truncate">{movie.director}</span>
        </div>
        <div className="flex items-center gap-1 mb-2 min-w-0" style={{ color: "var(--text-muted)" }}>
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate" style={{ fontSize: "0.72rem" }}>{countries.join(", ")}</span>
        </div>

        {!compact && (
          <p className="line-clamp-2 mb-3" style={{ color: "var(--text-secondary)", fontSize: "0.78rem", lineHeight: "1.4" }}>
            {movie.description}
          </p>
        )}

        {typeof score === "number" && score > 0 && (
          <div className="mb-2">
            <span className="px-2 py-0.5 rounded-full" style={{ color: "#fb7185", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", fontSize: "0.68rem", fontWeight: "700" }}>
              {Math.round(score)} match
            </span>
          </div>
        )}

        {/* Match reasons */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {matchReasons.slice(0, 2).map((reason) => (
              <span key={reason} className="px-2 py-0.5 rounded-full text-green-300" style={{ fontSize: "0.65rem", background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.3)" }}>
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Recommendation explanation */}
        {recommendationExplanation && (
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1 h-1 rounded-full" style={{ background: "#FF2D55" }} />
            <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>{recommendationExplanation}</span>
          </div>
        )}

        <div className="flex items-center justify-end mt-2">
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" />
        </div>
      </div>
    </div>
  );
}
