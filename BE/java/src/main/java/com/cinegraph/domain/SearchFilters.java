package com.cinegraph.domain;

public record SearchFilters(
        String genre,
        Integer minYear,
        Integer maxYear,
        Double minRating,
        String actor,
        String director,
        String language,
        String country,
        String type,
        int limit
) {
    public SearchFilters {
        genre = genre == null ? "" : genre;
        actor = actor == null ? "" : actor;
        director = director == null ? "" : director;
        language = language == null ? "" : language;
        country = country == null ? "" : country;
        type = type == null ? "" : type;
    }

    public static SearchFilters empty(int limit) {
        return new SearchFilters("", null, null, null, "", "", "", "", "", limit);
    }
}
