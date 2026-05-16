package com.cinegraph.service;

import com.cinegraph.domain.Movie;
import com.cinegraph.domain.Recommendation;
import com.cinegraph.graph.Edge;
import com.cinegraph.graph.MovieGraph;
import com.cinegraph.graph.RelationshipType;
import com.cinegraph.repository.InMemoryMovieStore;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Set;

public final class RecommendationService {
    private final InMemoryMovieStore movieStore;
    private final MovieGraph graph;
    private final InteractionService interactionService;
    private final RuntimeRecommendationSettings settings;
    private final double maxPopularity;
    private final double maxTrendScore;

    public RecommendationService(
            InMemoryMovieStore movieStore,
            MovieGraph graph,
            InteractionService interactionService,
            RuntimeRecommendationSettings settings
    ) {
        this.movieStore = movieStore;
        this.graph = graph;
        this.interactionService = interactionService;
        this.settings = settings;
        this.maxPopularity = movieStore.allMovies().stream().mapToDouble(Movie::popularity).max().orElse(0);
        this.maxTrendScore = movieStore.allMovies().stream().mapToDouble(Movie::trendScore).max().orElse(0);
    }

    public List<Recommendation> recommend(String seedMovieId, int threshold, int limit) {
        return recommend(seedMovieId, threshold, limit, "");
    }

    public List<Recommendation> recommend(String seedMovieId, int threshold, int limit, String userId) {
        Movie seedMovie = movieStore.findById(seedMovieId)
                .orElseThrow(() -> new IllegalArgumentException("Seed movie not found: " + seedMovieId));

        Map<String, CandidateScore> candidateScores = collectSharedNeighborCandidates(seedMovie);
        if (candidateScores.isEmpty()) {
            return List.of();
        }

        List<ScoredCandidate> scoredCandidates = new ArrayList<>();
        double minRaw = Double.POSITIVE_INFINITY;
        double maxRaw = Double.NEGATIVE_INFINITY;

        for (Map.Entry<String, CandidateScore> entry : candidateScores.entrySet()) {
            Movie candidate = movieStore.findById(entry.getKey()).orElse(null);
            if (candidate == null) {
                continue;
            }

            CandidateScore score = entry.getValue();
            score.addReleaseYearSimilarity(releaseYearSimilarity(seedMovie, candidate));
            double interactionScore = interactionService.score(userId, candidate.id());
            double qualityBonus = qualityBonus(candidate);
            double rawFinalScore = settings.finalScore(score.graphSimilarityScore(), interactionScore, qualityBonus);
            minRaw = Math.min(minRaw, rawFinalScore);
            maxRaw = Math.max(maxRaw, rawFinalScore);
            scoredCandidates.add(new ScoredCandidate(candidate, score, interactionScore, qualityBonus, rawFinalScore));
        }

        PriorityQueue<Recommendation> topK = new PriorityQueue<>(Comparator.comparingDouble(Recommendation::normalizedScore));
        for (ScoredCandidate scored : scoredCandidates) {
            double normalized = normalize(scored.rawFinalScore, minRaw, maxRaw);
            if (normalized < threshold) {
                continue;
            }

            Recommendation recommendation = new Recommendation(
                    scored.movie,
                    normalized,
                    scored.score.graphSimilarityScore(),
                    scored.interactionScore,
                    scored.qualityBonus,
                    scored.rawFinalScore,
                    reasons(scored.score, scored.interactionScore, scored.qualityBonus)
            );

            topK.offer(recommendation);
            if (topK.size() > limit) {
                topK.poll();
            }
        }

        List<Recommendation> recommendations = new ArrayList<>(topK);
        recommendations.sort(Comparator
                .comparingDouble(Recommendation::normalizedScore).reversed()
                .thenComparing((Recommendation recommendation) -> recommendation.movie().voteAverage(), Comparator.reverseOrder()));
        return recommendations;
    }

    private Map<String, CandidateScore> collectSharedNeighborCandidates(Movie seedMovie) {
        Map<String, CandidateScore> candidateScores = new java.util.HashMap<>();
        String seedNode = MovieGraph.movieNode(seedMovie.id());

        for (Edge metadataEdge : graph.neighbors(seedNode)) {
            String metadataNode = metadataEdge.targetNodeId();
            for (Edge candidateEdge : graph.neighbors(metadataNode)) {
                if (!MovieGraph.isMovieNode(candidateEdge.targetNodeId())) {
                    continue;
                }
                String candidateMovieId = MovieGraph.movieIdFromNode(candidateEdge.targetNodeId());
                if (candidateMovieId.equals(seedMovie.id())) {
                    continue;
                }
                candidateScores
                        .computeIfAbsent(candidateMovieId, ignored -> new CandidateScore())
                        .add(metadataEdge.relationshipType(), metadataEdge.label(), settings.relationshipWeight(metadataEdge.relationshipType()));
            }
        }

        return candidateScores;
    }

    private double releaseYearSimilarity(Movie seedMovie, Movie candidate) {
        if (seedMovie.releaseYear() == 0 || candidate.releaseYear() == 0) {
            return 0;
        }
        int gap = Math.abs(seedMovie.releaseYear() - candidate.releaseYear());
        if (gap <= 3) {
            return 1.0;
        }
        if (gap <= 5) {
            return 0.5;
        }
        return 0;
    }

    private double qualityBonus(Movie movie) {
        double ratingBonus = movie.voteAverage() <= 0 ? 0 : Math.min(10, movie.voteAverage());
        double voteCountBonus = Math.min(5, Math.log10(movie.voteCount() + 1));
        double popularityBonus = maxPopularity <= 0 ? 0 : 5.0 * movie.popularity() / maxPopularity;
        double trendBonus = maxTrendScore <= 0 ? 0 : 5.0 * movie.trendScore() / maxTrendScore;
        return ratingBonus + voteCountBonus + popularityBonus + trendBonus;
    }

    private double normalize(double value, double min, double max) {
        if (Double.compare(min, max) == 0) {
            return 100;
        }
        return 100.0 * (value - min) / (max - min);
    }

    private List<String> reasons(CandidateScore score, double interactionScore, double qualityBonus) {
        List<String> reasons = new ArrayList<>();
        for (RelationshipType type : RelationshipType.values()) {
            Set<String> labels = score.sharedLabels(type);
            if (!labels.isEmpty()) {
                reasons.add(type.reasonLabel() + ": " + shortList(labels));
            }
        }
        if (score.releaseYearScore > 0) {
            reasons.add("Similar release period");
        }
        if (interactionScore > 0) {
            reasons.add("Strong user interaction signal");
        }
        if (qualityBonus >= 10) {
            reasons.add("Quality bonus from rating or trend");
        }
        return reasons.isEmpty() ? List.of("Related through graph metadata") : reasons;
    }

    private String shortList(Set<String> labels) {
        List<String> ordered = new ArrayList<>(labels);
        int end = Math.min(3, ordered.size());
        String suffix = ordered.size() > end ? " +" + (ordered.size() - end) + " more" : "";
        return String.join(", ", ordered.subList(0, end)) + suffix;
    }

    private static final class CandidateScore {
        private final Map<RelationshipType, LinkedHashSet<String>> sharedLabels = new EnumMap<>(RelationshipType.class);
        private double graphSimilarityScore;
        private double releaseYearScore;

        private void add(RelationshipType type, String label, double weight) {
            LinkedHashSet<String> labels = sharedLabels.computeIfAbsent(type, ignored -> new LinkedHashSet<>());
            if (labels.add(label)) {
                graphSimilarityScore += weight;
            }
        }

        private void addReleaseYearSimilarity(double score) {
            if (score > 0) {
                releaseYearScore = score;
                graphSimilarityScore += score;
            }
        }

        private double graphSimilarityScore() {
            return graphSimilarityScore;
        }

        private Set<String> sharedLabels(RelationshipType type) {
            return sharedLabels.getOrDefault(type, new LinkedHashSet<>());
        }
    }

    private record ScoredCandidate(
            Movie movie,
            CandidateScore score,
            double interactionScore,
            double qualityBonus,
            double rawFinalScore
    ) {
    }
}
