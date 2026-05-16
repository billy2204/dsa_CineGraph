package com.cinegraph.repository;

import com.cinegraph.domain.Movie;
import com.cinegraph.json.JsonParser;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class JsonlMovieRepository implements MovieRepository {
    private final Path dataPath;

    public JsonlMovieRepository(Path dataPath) {
        this.dataPath = dataPath;
    }

    @Override
    public List<Movie> loadMovies() throws IOException {
        List<Movie> movies = new ArrayList<>();
        try (BufferedReader reader = Files.newBufferedReader(dataPath, StandardCharsets.UTF_8)) {
            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) {
                    continue;
                }
                try {
                    movies.add(toMovie(JsonParser.parseObject(line)));
                } catch (RuntimeException exception) {
                    throw new IOException("Cannot parse movie JSONL line " + lineNumber, exception);
                }
            }
        }
        return List.copyOf(movies);
    }

    private Movie toMovie(Map<String, Object> row) {
        return new Movie(
                text(row, "movie_id"),
                text(row, "title"),
                text(row, "original_title"),
                text(row, "type"),
                integer(row, "release_year"),
                text(row, "release_date"),
                text(row, "director"),
                stringList(row, "actors"),
                stringList(row, "genres"),
                stringList(row, "keywords"),
                text(row, "description"),
                stringList(row, "countries"),
                stringList(row, "languages"),
                stringList(row, "production_companies"),
                text(row, "maturity_rating"),
                decimal(row, "vote_average"),
                integer(row, "vote_count"),
                decimal(row, "popularity"),
                integer(row, "runtime_minutes"),
                decimal(row, "trend_score"),
                decimal(row, "data_quality_score"),
                integer(row, "catalog_rank")
        );
    }

    private String text(Map<String, Object> row, String key) {
        Object value = row.get(key);
        return value == null ? "" : String.valueOf(value).trim();
    }

    private int integer(Map<String, Object> row, String key) {
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

    private double decimal(Map<String, Object> row, String key) {
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

    private List<String> stringList(Map<String, Object> row, String key) {
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
