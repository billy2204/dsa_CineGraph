package com.cinegraph.service;

import com.cinegraph.domain.InteractionStats;
import com.cinegraph.index.Normalizer;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public final class InteractionService {
    private static final String GUEST_USER_ID = "guest";

    private final RuntimeRecommendationSettings settings;
    private final Map<String, InteractionStats> globalMovieStats = new ConcurrentHashMap<>();
    private final Map<String, Map<String, InteractionStats>> userMovieStats = new ConcurrentHashMap<>();
    private final Map<String, AtomicInteger> queryFrequency = new ConcurrentHashMap<>();

    public InteractionService(RuntimeRecommendationSettings settings) {
        this.settings = settings;
    }

    public void recordSearch(String userId, String query, List<String> exposedMovieIds) {
        String normalizedQuery = Normalizer.normalize(query);
        if (!normalizedQuery.isBlank()) {
            queryFrequency.computeIfAbsent(normalizedQuery, ignored -> new AtomicInteger()).incrementAndGet();
        }
        for (String movieId : exposedMovieIds) {
            globalStats(movieId).addSearchExposure();
            userStats(userId, movieId).addSearchExposure();
        }
    }

    public void recordClick(String userId, String movieId) {
        globalStats(movieId).addClick();
        userStats(userId, movieId).addClick();
    }

    public void recordView(String userId, String movieId) {
        globalStats(movieId).addView();
        userStats(userId, movieId).addView();
    }

    public void recordFavorite(String userId, String movieId) {
        globalStats(movieId).addFavorite();
        userStats(userId, movieId).addFavorite();
    }

    public void recordWatchlist(String userId, String movieId) {
        globalStats(movieId).addWatchlist();
        userStats(userId, movieId).addWatchlist();
    }

    public void recordRating(String userId, String movieId, double rating) {
        globalStats(movieId).addRating(rating);
        userStats(userId, movieId).addRating(rating);
    }

    public double score(String userId, String movieId) {
        double globalScore = scoreFrom(globalMovieStats.get(movieId), maxStats(globalMovieStats));
        String normalizedUserId = normalizeUserId(userId);
        if (GUEST_USER_ID.equals(normalizedUserId)) {
            return globalScore;
        }

        Map<String, InteractionStats> perUserStats = userMovieStats.getOrDefault(normalizedUserId, Map.of());
        double userScore = scoreFrom(perUserStats.get(movieId), maxStats(perUserStats));
        double userBlend = settings.userInteractionBlend();
        return userBlend * userScore + (1 - userBlend) * globalScore;
    }

    public int queryCount(String query) {
        AtomicInteger count = queryFrequency.get(Normalizer.normalize(query));
        return count == null ? 0 : count.get();
    }

    private double scoreFrom(InteractionStats stats, MaxStats max) {
        if (stats == null) {
            return 0;
        }

        double search = normalizeCount(stats.searchCount(), max.searchCount);
        double click = normalizeCount(stats.clickCount(), max.clickCount);
        double view = normalizeCount(stats.viewCount(), max.viewCount);
        double favorite = normalizeCount(stats.favoriteCount(), max.favoriteCount);
        double watchlist = normalizeCount(stats.watchlistCount(), max.watchlistCount);
        double rating = stats.averageRating();
        double recency = recencyScore(stats.lastInteractedAt());

        return search
                + 2 * click
                + 2 * view
                + 3 * watchlist
                + 4 * favorite
                + 4 * rating
                + 2 * recency;
    }

    private InteractionStats globalStats(String movieId) {
        return globalMovieStats.computeIfAbsent(movieId, ignored -> new InteractionStats());
    }

    private InteractionStats userStats(String userId, String movieId) {
        return userMovieStats
                .computeIfAbsent(normalizeUserId(userId), ignored -> new ConcurrentHashMap<>())
                .computeIfAbsent(movieId, ignored -> new InteractionStats());
    }

    private String normalizeUserId(String userId) {
        String normalized = Normalizer.normalize(userId);
        return normalized.isBlank() ? GUEST_USER_ID : normalized;
    }

    private MaxStats maxStats(Map<String, InteractionStats> statsByMovieId) {
        int maxSearch = 0;
        int maxClick = 0;
        int maxView = 0;
        int maxFavorite = 0;
        int maxWatchlist = 0;

        for (InteractionStats stats : statsByMovieId.values()) {
            maxSearch = Math.max(maxSearch, stats.searchCount());
            maxClick = Math.max(maxClick, stats.clickCount());
            maxView = Math.max(maxView, stats.viewCount());
            maxFavorite = Math.max(maxFavorite, stats.favoriteCount());
            maxWatchlist = Math.max(maxWatchlist, stats.watchlistCount());
        }
        return new MaxStats(maxSearch, maxClick, maxView, maxFavorite, maxWatchlist);
    }

    private double normalizeCount(int value, int max) {
        return max == 0 ? 0 : 10.0 * value / max;
    }

    private double recencyScore(Instant lastInteractedAt) {
        if (lastInteractedAt == null) {
            return 0;
        }
        long hours = Math.max(0, Duration.between(lastInteractedAt, Instant.now()).toHours());
        return 10.0 * Math.exp(-hours / (24.0 * 14.0));
    }

    private record MaxStats(int searchCount, int clickCount, int viewCount, int favoriteCount, int watchlistCount) {
    }
}
