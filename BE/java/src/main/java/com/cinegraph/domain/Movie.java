package com.cinegraph.domain;

import java.util.List;

public record Movie(
        String id,
        String title,
        String originalTitle,
        String type,
        int releaseYear,
        String releaseDate,
        String director,
        List<String> actors,
        List<String> genres,
        List<String> keywords,
        String description,
        List<String> countries,
        List<String> languages,
        List<String> productionCompanies,
        String maturityRating,
        double voteAverage,
        int voteCount,
        double popularity,
        int runtimeMinutes,
        double trendScore,
        double dataQualityScore,
        int catalogRank
) {
    public Movie {
        id = safe(id);
        title = safe(title);
        originalTitle = safe(originalTitle);
        type = safe(type);
        releaseDate = safe(releaseDate);
        director = safe(director);
        description = safe(description);
        maturityRating = safe(maturityRating);
        actors = List.copyOf(actors == null ? List.of() : actors);
        genres = List.copyOf(genres == null ? List.of() : genres);
        keywords = List.copyOf(keywords == null ? List.of() : keywords);
        countries = List.copyOf(countries == null ? List.of() : countries);
        languages = List.copyOf(languages == null ? List.of() : languages);
        productionCompanies = List.copyOf(productionCompanies == null ? List.of() : productionCompanies);
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }
}
