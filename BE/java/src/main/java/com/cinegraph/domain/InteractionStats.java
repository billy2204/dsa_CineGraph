package com.cinegraph.domain;

import java.time.Instant;

public final class InteractionStats {
    private int searchCount;
    private int clickCount;
    private int viewCount;
    private int favoriteCount;
    private int watchlistCount;
    private double ratingSum;
    private int ratingCount;
    private Instant lastInteractedAt;

    public synchronized void addSearchExposure() {
        searchCount++;
        touch();
    }

    public synchronized void addClick() {
        clickCount++;
        touch();
    }

    public synchronized void addView() {
        viewCount++;
        touch();
    }

    public synchronized void addFavorite() {
        favoriteCount++;
        touch();
    }

    public synchronized void addWatchlist() {
        watchlistCount++;
        touch();
    }

    public synchronized void addRating(double rating) {
        ratingSum += Math.max(0, Math.min(10, rating));
        ratingCount++;
        touch();
    }

    public synchronized int searchCount() {
        return searchCount;
    }

    public synchronized int clickCount() {
        return clickCount;
    }

    public synchronized int viewCount() {
        return viewCount;
    }

    public synchronized int favoriteCount() {
        return favoriteCount;
    }

    public synchronized int watchlistCount() {
        return watchlistCount;
    }

    public synchronized double averageRating() {
        return ratingCount == 0 ? 0 : ratingSum / ratingCount;
    }

    public synchronized Instant lastInteractedAt() {
        return lastInteractedAt;
    }

    private void touch() {
        lastInteractedAt = Instant.now();
    }
}
