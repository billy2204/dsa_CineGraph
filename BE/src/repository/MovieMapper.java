package repository;

import domain.Movie;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

final class MovieMapper {
    private MovieMapper() {
    }

    static Movie toMovie(Map<String, Object> row) {
        List<String> countries = stringList(row, "countries");
        String rawTitle = text(row, "title");
        String rawOriginalTitle = text(row, "original_title");
        String displayTitle = displayTitle(rawTitle, rawOriginalTitle, countries);
        String originalTitle = displayTitle.equals(rawTitle) ? rawOriginalTitle : rawTitle;

        return new Movie(
                text(row, "movie_id"),
                displayTitle,
                originalTitle,
                text(row, "type"),
                integer(row, "release_year"),
                text(row, "release_date"),
                text(row, "director"),
                stringList(row, "actors"),
                stringList(row, "genres"),
                stringList(row, "keywords"),
                text(row, "description"),
                countries,
                stringList(row, "languages"),
                stringList(row, "production_companies"),
                text(row, "maturity_rating"),
                normalizedRating(row),
                integer(row, "vote_count"),
                decimal(row, "popularity"),
                integer(row, "runtime_minutes"),
                decimal(row, "trend_score"),
                decimal(row, "data_quality_score"),
                integer(row, "catalog_rank")
        );
    }

    private static String displayTitle(String title, String originalTitle, List<String> countries) {
        if (title.isBlank() || originalTitle.isBlank() || title.equals(originalTitle)) {
            return title;
        }
        if (countries.stream().noneMatch(country -> "vietnam".equalsIgnoreCase(country.trim()))) {
            return title;
        }
        return looksVietnamese(originalTitle) ? originalTitle : title;
    }

    private static boolean looksVietnamese(String value) {
        return value.matches(".*[ăâđêôơưĂÂĐÊÔƠƯàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ].*");
    }

    private static double normalizedRating(Map<String, Object> row) {
        double rating = decimal(row, "vote_average");
        if (rating > 10 && rating <= 100) {
            rating = rating / 10.0;
        }
        if (rating > 0) {
            return roundOne(Math.max(0.1, Math.min(10, rating)));
        }

        double quality = decimal(row, "data_quality_score");
        if (quality > 1) {
            quality = quality / 100.0;
        }
        quality = Math.max(0, Math.min(1, quality));
        double trend = Math.log1p(Math.max(0, decimal(row, "trend_score"))) / Math.log1p(1000);
        int rank = integer(row, "catalog_rank");
        double rankBonus = rank > 0 ? Math.max(0, 1.0 - Math.log10(rank + 1) / 4.0) : 0;
        return roundOne(Math.max(4.5, Math.min(7.2, 4.8 + quality * 1.2 + trend * 0.8 + rankBonus * 0.4)));
    }

    private static double roundOne(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private static String text(Map<String, Object> row, String key) {
        Object value = row.get(key);
        return value == null ? "" : String.valueOf(value).trim();
    }

    private static int integer(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        String text = text(row, key);
        if (text.isBlank()) {
            return 0;
        }
        try {
            return (int) Double.parseDouble(text);
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

    private static double decimal(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        String text = text(row, key);
        if (text.isBlank()) {
            return 0;
        }
        try {
            return Double.parseDouble(text);
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

    private static List<String> stringList(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (!(value instanceof List<?> rawItems)) {
            return List.of();
        }

        List<String> items = new ArrayList<>();
        for (Object rawItem : rawItems) {
            String item = rawItem == null ? "" : String.valueOf(rawItem).trim();
            if (!item.isBlank()) {
                items.add(item);
            }
        }
        return items;
    }
}
