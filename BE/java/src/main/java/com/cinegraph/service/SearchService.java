package com.cinegraph.service;

import com.cinegraph.domain.Movie;
import com.cinegraph.domain.SearchFilters;
import com.cinegraph.domain.SearchResult;
import com.cinegraph.index.IndexedField;
import com.cinegraph.index.Normalizer;
import com.cinegraph.index.SearchIndex;
import com.cinegraph.repository.InMemoryMovieStore;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

public final class SearchService {
    private static final int DEFAULT_LIMIT = 12;

    private final InMemoryMovieStore movieStore;
    private final SearchIndex searchIndex;

    public SearchService(InMemoryMovieStore movieStore, SearchIndex searchIndex) {
        this.movieStore = movieStore;
        this.searchIndex = searchIndex;
    }

    public List<SearchResult> search(String query, SearchFilters filters) {
        String normalizedQuery = Normalizer.normalize(query);
        int limit = filters.limit() > 0 ? filters.limit() : DEFAULT_LIMIT;
        Map<String, ScoreAccumulator> candidates = new LinkedHashMap<>();

        if (normalizedQuery.isBlank()) {
            for (Movie movie : movieStore.allMovies()) {
                ScoreAccumulator accumulator = candidates.computeIfAbsent(movie.id(), ignored -> new ScoreAccumulator());
                accumulator.add(qualitySearchBonus(movie), "Ranked by movie quality");
            }
        } else {
            searchIndex.exactTitle(normalizedQuery).ifPresent(movieId ->
                    candidates.computeIfAbsent(movieId, ignored -> new ScoreAccumulator())
                            .add(100, "Exact title match"));

            for (String movieId : searchIndex.titleTrie().searchPrefix(normalizedQuery, limit * 4)) {
                candidates.computeIfAbsent(movieId, ignored -> new ScoreAccumulator())
                        .add(70, "Title prefix match");
            }

            for (String token : Normalizer.tokens(normalizedQuery)) {
                Map<String, EnumSet<IndexedField>> postings = searchIndex.invertedIndex().find(token);
                for (Map.Entry<String, EnumSet<IndexedField>> posting : postings.entrySet()) {
                    ScoreAccumulator accumulator = candidates.computeIfAbsent(posting.getKey(), ignored -> new ScoreAccumulator());
                    for (IndexedField field : posting.getValue()) {
                        accumulator.add(field.searchWeight(), field.reasonLabel() + " match: " + token);
                    }
                }
            }

            for (String movieId : new ArrayList<>(candidates.keySet())) {
                movieStore.findById(movieId).ifPresent(movie -> {
                    ScoreAccumulator accumulator = candidates.get(movieId);
                    addQualityTiebreakers(movie, accumulator);
                });
            }
        }

        return candidates.entrySet().stream()
                .map(entry -> movieStore.findById(entry.getKey())
                        .map(movie -> new SearchResult(movie, entry.getValue().score, entry.getValue().reasons()))
                        .orElse(null))
                .filter(result -> result != null && matchesFilters(result.movie(), filters))
                .sorted(searchRanking())
                .limit(limit)
                .toList();
    }

    private boolean matchesFilters(Movie movie, SearchFilters filters) {
        if (!filters.genre().isBlank() && movie.genres().stream().noneMatch(value -> sameOrContains(value, filters.genre()))) {
            return false;
        }
        if (filters.minYear() != null && movie.releaseYear() < filters.minYear()) {
            return false;
        }
        if (filters.maxYear() != null && movie.releaseYear() > filters.maxYear()) {
            return false;
        }
        if (filters.minRating() != null && movie.voteAverage() < filters.minRating()) {
            return false;
        }
        if (!filters.actor().isBlank() && movie.actors().stream().noneMatch(value -> sameOrContains(value, filters.actor()))) {
            return false;
        }
        if (!filters.director().isBlank() && !sameOrContains(movie.director(), filters.director())) {
            return false;
        }
        if (!filters.language().isBlank() && movie.languages().stream().noneMatch(value -> sameOrContains(value, filters.language()))) {
            return false;
        }
        if (!filters.country().isBlank() && movie.countries().stream().noneMatch(value -> sameOrContains(value, filters.country()))) {
            return false;
        }
        return filters.type().isBlank() || sameOrContains(movie.type(), filters.type());
    }

    private boolean sameOrContains(String value, String query) {
        return Normalizer.containsNormalized(value, query);
    }

    private void addQualityTiebreakers(Movie movie, ScoreAccumulator accumulator) {
        if (movie.voteAverage() >= 7.5) {
            accumulator.add(10, "High rating bonus");
        }
        if (movie.popularity() > 0 || movie.trendScore() > 0) {
            accumulator.add(Math.min(10, Math.log10(Math.max(1, movie.popularity())) + movie.trendScore() / 250.0),
                    "Popularity bonus");
        }
    }

    private double qualitySearchBonus(Movie movie) {
        double rating = movie.voteAverage() > 0 ? movie.voteAverage() * 10 : 0;
        double trend = Math.min(20, movie.trendScore() / 50.0);
        double rank = movie.catalogRank() > 0 ? Math.max(0, 20 - Math.log10(movie.catalogRank() + 1) * 5) : 0;
        return rating + trend + rank;
    }

    private Comparator<SearchResult> searchRanking() {
        return Comparator
                .comparingDouble(SearchResult::score).reversed()
                .thenComparing((SearchResult result) -> result.movie().voteAverage(), Comparator.reverseOrder())
                .thenComparing((SearchResult result) -> result.movie().popularity(), Comparator.reverseOrder())
                .thenComparing((SearchResult result) -> result.movie().releaseYear(), Comparator.reverseOrder());
    }

    private static final class ScoreAccumulator {
        private double score;
        private final LinkedHashSet<String> reasons = new LinkedHashSet<>();

        private void add(double amount, String reason) {
            score += amount;
            if (reason != null && !reason.isBlank()) {
                reasons.add(reason);
            }
        }

        private List<String> reasons() {
            return List.copyOf(reasons);
        }
    }
}
