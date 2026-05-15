import { Star, Clock, ChevronRight } from "lucide-react";
import { Movie } from "./movieData";
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
  const scoreColor = movie.rating >= 8.5 ? "#4CAF50" : movie.rating >= 7.5 ? "#FFC107" : "#FF6B35";

  return (
    <div
      onClick={() => onClick(movie)}
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "rgba(255,45,85,0.4)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,45,85,0.2)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
      }}
    >
      {/* Poster */}
      <div className={`relative overflow-hidden ${compact ? "h-36" : "h-48"}`}>
        <ImageWithFallback
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)" }} />

        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <Star className="w-3 h-3" style={{ color: scoreColor, fill: scoreColor }} />
          <span className="text-white" style={{ fontSize: "0.75rem", fontWeight: "700" }}>{movie.rating}</span>
        </div>

        {/* Genres overlay */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          {movie.genres.slice(0, 2).map((g) => (
            <span
              key={g}
              className="px-2 py-0.5 rounded-full text-white"
              style={{ fontSize: "0.65rem", fontWeight: "600", background: "rgba(255,45,85,0.6)", backdropFilter: "blur(8px)" }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-white mb-1 line-clamp-1" style={{ fontSize: compact ? "0.85rem" : "0.95rem", fontWeight: "700" }}>
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <span style={{ fontSize: "0.75rem" }}>{movie.year}</span>
          <span style={{ fontSize: "0.75rem" }}>·</span>
          <Clock className="w-3 h-3" />
          <span style={{ fontSize: "0.75rem" }}>{movie.duration}m</span>
          <span style={{ fontSize: "0.75rem" }}>·</span>
          <span style={{ fontSize: "0.75rem" }} className="truncate">{movie.director}</span>
        </div>

        {!compact && (
          <p className="text-gray-400 line-clamp-2 mb-3" style={{ fontSize: "0.78rem", lineHeight: "1.4" }}>
            {movie.description}
          </p>
        )}

        {/* Match reasons */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {matchReasons.slice(0, 2).map((reason) => (
              <span key={reason} className="px-2 py-0.5 rounded-full text-green-300" style={{ fontSize: "0.65rem", background: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.3)" }}>
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Recommendation explanation */}
        {recommendationExplanation && (
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1 h-1 rounded-full" style={{ background: "#FF2D55" }} />
            <span className="text-gray-400" style={{ fontSize: "0.7rem" }}>{recommendationExplanation}</span>
          </div>
        )}

        <div className="flex items-center justify-end mt-2">
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" />
        </div>
      </div>
    </div>
  );
}
