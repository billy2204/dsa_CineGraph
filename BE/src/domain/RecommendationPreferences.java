package domain;

import java.util.List;

public record RecommendationPreferences(
        List<String> genres,
        List<String> countries,
        List<String> actors,
        List<String> directors,
        List<String> keywords,
        double genreWeight,
        double countryWeight,
        double actorWeight,
        double directorWeight,
        double keywordWeight
) {
    public RecommendationPreferences {
        genres = List.copyOf(genres == null ? List.of() : genres);
        countries = List.copyOf(countries == null ? List.of() : countries);
        actors = List.copyOf(actors == null ? List.of() : actors);
        directors = List.copyOf(directors == null ? List.of() : directors);
        keywords = List.copyOf(keywords == null ? List.of() : keywords);
        genreWeight = safeWeight(genreWeight);
        countryWeight = safeWeight(countryWeight);
        actorWeight = safeWeight(actorWeight);
        directorWeight = safeWeight(directorWeight);
        keywordWeight = safeWeight(keywordWeight);
    }

    public static RecommendationPreferences empty() {
        return new RecommendationPreferences(List.of(), List.of(), List.of(), List.of(), List.of(), 0, 0, 0, 0, 0);
    }

    public boolean isEmpty() {
        return genres.isEmpty()
                && countries.isEmpty()
                && actors.isEmpty()
                && directors.isEmpty()
                && keywords.isEmpty();
    }

    private static double safeWeight(double value) {
        if (Double.isNaN(value) || Double.isInfinite(value) || value < 0) {
            return 0;
        }
        return Math.min(100, value);
    }
}
