package repository;

import config.AppConfig;
import domain.Movie;
import json.JsonParser;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class PostgresMovieRepository implements MovieRepository {
    private final AppConfig config;

    public PostgresMovieRepository(AppConfig config) {
        this.config = config;
    }

    @Override
    public List<Movie> loadMovies() throws IOException {
        String schema = config.valueOrDefault("db.schema", "public");
        String table = config.valueOrDefault("db.table", "movies");
        String sql = movieQuery(schema, table);

        ProcessBuilder processBuilder = new ProcessBuilder(
                config.valueOrDefault("db.psql.bin", "psql"),
                "-X",
                "-q",
                "-t",
                "-A",
                "-v",
                "ON_ERROR_STOP=1",
                "-c",
                sql
        );
        Map<String, String> processEnv = processBuilder.environment();
        putRequired(processEnv, "PGHOST", "db.host");
        putRequired(processEnv, "PGPORT", "db.port");
        putRequired(processEnv, "PGDATABASE", "db.name");
        putRequired(processEnv, "PGUSER", "db.user");
        putRequired(processEnv, "PGPASSWORD", "db.password");
        putOptional(processEnv, "PGSSLMODE", "db.sslmode");
        String sslRootCert = config.value("db.sslrootcert").isBlank() ? "" : config.resolvedPath("db.sslrootcert", "").toString();
        if (!sslRootCert.isBlank()) {
            processEnv.put("PGSSLROOTCERT", sslRootCert);
        }

        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        List<Movie> movies = new ArrayList<>();
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8)
        )) {
            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                output.append(line).append('\n');
                if (!line.startsWith("{")) {
                    continue;
                }
                lineNumber++;
                try {
                    movies.add(MovieMapper.toMovie(JsonParser.parseObject(line)));
                } catch (RuntimeException exception) {
                    throw new IOException("Cannot parse DB movie row " + lineNumber, exception);
                }
            }
        }

        try {
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new IOException("psql exited with code " + exitCode + ":\n" + output);
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IOException("Interrupted while loading movies from PostgreSQL", exception);
        }

        if (movies.isEmpty()) {
            throw new IOException("No movies loaded from " + quoteIdent(schema) + "." + quoteIdent(table));
        }
        return List.copyOf(movies);
    }

    private void putRequired(Map<String, String> processEnv, String envKey, String configKey) {
        String value = config.value(configKey);
        if (value.isBlank()) {
            throw new IllegalArgumentException(configKey + " is missing in " + config.path());
        }
        processEnv.put(envKey, value);
    }

    private void putOptional(Map<String, String> processEnv, String envKey, String configKey) {
        String value = config.value(configKey);
        if (!value.isBlank()) {
            processEnv.put(envKey, value);
        }
    }

    private String movieQuery(String schema, String table) {
        String fullTable = quoteIdent(schema) + "." + quoteIdent(table);
        return """
                SELECT row_to_json(movie_row)::text
                FROM (
                    SELECT
                        catalog_rank,
                        movie_id,
                        title,
                        original_title,
                        type,
                        release_year,
                        COALESCE(release_date::text, '') AS release_date,
                        director,
                        COALESCE(actors, '[]'::jsonb) AS actors,
                        COALESCE(genres, '[]'::jsonb) AS genres,
                        COALESCE(keywords, '[]'::jsonb) AS keywords,
                        description,
                        COALESCE(countries, '[]'::jsonb) AS countries,
                        COALESCE(languages, '[]'::jsonb) AS languages,
                        COALESCE(production_companies, '[]'::jsonb) AS production_companies,
                        maturity_rating,
                        vote_average,
                        vote_count,
                        popularity,
                        runtime_minutes,
                        trend_score,
                        data_quality_score
                    FROM %s
                    ORDER BY catalog_rank NULLS LAST, title
                ) AS movie_row
                """.formatted(fullTable);
    }

    private String quoteIdent(String identifier) {
        if (identifier == null || !identifier.matches("[A-Za-z_][A-Za-z0-9_]*")) {
            throw new IllegalArgumentException("Unsafe SQL identifier: " + identifier);
        }
        return "\"" + identifier + "\"";
    }
}
