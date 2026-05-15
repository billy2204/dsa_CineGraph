import { X, Star, Clock, User, Film, Tag, ThumbsUp } from "lucide-react";
import { Movie } from "./movieData";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export function MovieModal({ movie, onClose }: MovieModalProps) {
  if (!movie) return null;
  const scoreColor = movie.rating >= 8.5 ? "#4CAF50" : movie.rating >= 7.5 ? "#FFC107" : "#FF6B35";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #0f0f1a 0%, #1a0a14 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-64 overflow-hidden rounded-t-2xl">
          <ImageWithFallback
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(15,15,26,0.95) 100%)" }} />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,45,85,0.7)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.6)")}
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="absolute bottom-4 left-6 right-16">
            <h2 className="text-white mb-1" style={{ fontSize: "1.5rem", fontWeight: "800" }}>{movie.title}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" style={{ color: scoreColor, fill: scoreColor }} />
                <span className="text-white" style={{ fontWeight: "700" }}>{movie.rating}/10</span>
              </div>
              <span className="text-gray-300" style={{ fontSize: "0.85rem" }}>{movie.year}</span>
              <div className="flex items-center gap-1 text-gray-300">
                <Clock className="w-3 h-3" />
                <span style={{ fontSize: "0.85rem" }}>{movie.duration} min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((g) => (
              <span
                key={g}
                className="px-3 py-1 rounded-full text-white"
                style={{ fontSize: "0.8rem", fontWeight: "600", background: "linear-gradient(135deg, rgba(255,45,85,0.3), rgba(255,107,53,0.3))", border: "1px solid rgba(255,45,85,0.4)" }}
              >
                {g}
              </span>
            ))}
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-300" style={{ fontSize: "0.9rem", lineHeight: "1.7" }}>{movie.description}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 gap-4">
            {/* Director */}
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Film className="w-4 h-4 mt-0.5 text-red-400" />
              <div>
                <div className="text-gray-500 mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Director</div>
                <div className="text-white" style={{ fontSize: "0.9rem" }}>{movie.director}</div>
              </div>
            </div>

            {/* Cast */}
            <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-red-400" />
                <div className="text-gray-500" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Cast</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {movie.actors.map((a) => (
                  <span key={a} className="text-gray-300 px-2 py-0.5 rounded-lg" style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.06)" }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Keywords / Graph Nodes */}
            <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-red-400" />
                <div className="text-gray-500" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Graph Keywords</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {movie.keywords.map((k) => (
                  <span key={k} className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.75rem", color: "#a78bfa", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)" }}>
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Graph connection info */}
          <div className="p-3 rounded-xl" style={{ background: "rgba(255,45,85,0.05)", border: "1px solid rgba(255,45,85,0.15)" }}>
            <div className="flex items-center gap-2 mb-1">
              <ThumbsUp className="w-4 h-4 text-red-400" />
              <span className="text-red-300" style={{ fontSize: "0.8rem", fontWeight: "600" }}>Graph Connections</span>
            </div>
            <p className="text-gray-400" style={{ fontSize: "0.78rem" }}>
              This movie is connected to <strong className="text-white">{movie.genres.length} genres</strong>, <strong className="text-white">{movie.actors.length} actors</strong>, and <strong className="text-white">{movie.keywords.length} keyword nodes</strong> in the graph. Our recommendation engine uses these edges to find similar films.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
