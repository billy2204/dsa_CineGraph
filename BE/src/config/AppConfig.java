package config;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

public final class AppConfig {
    private static final Map<String, String> LEGACY_ENV_KEYS = Map.ofEntries(
            Map.entry("server.port", "PORT"),
            Map.entry("movie.source", "MOVIE_SOURCE"),
            Map.entry("movie.data.path", "MOVIE_DATA_PATH"),
            Map.entry("db.psql.bin", "PSQL_BIN"),
            Map.entry("db.host", "PGHOST"),
            Map.entry("db.port", "PGPORT"),
            Map.entry("db.name", "PGDATABASE"),
            Map.entry("db.user", "PGUSER"),
            Map.entry("db.password", "PGPASSWORD"),
            Map.entry("db.sslmode", "PGSSLMODE"),
            Map.entry("db.sslrootcert", "PGSSLROOTCERT"),
            Map.entry("db.schema", "PGSCHEMA"),
            Map.entry("db.table", "PGTABLE")
    );

    private final Path path;
    private final Properties properties;

    private AppConfig(Path path, Properties properties) {
        this.path = path;
        this.properties = properties;
    }

    public static AppConfig load(Path path) throws IOException {
        Path absolutePath = path.toAbsolutePath().normalize();
        if (!Files.exists(absolutePath)) {
            throw new IOException("Cannot find config file: " + absolutePath);
        }

        Properties properties = new Properties();
        try (Reader reader = Files.newBufferedReader(absolutePath, StandardCharsets.UTF_8)) {
            properties.load(reader);
        }
        return new AppConfig(absolutePath, properties);
    }

    public String path() {
        return path.toString();
    }

    public String value(String key) {
        if (key == null || key.isBlank()) {
            return "";
        }
        String runtimeValue = firstNonBlank(readEnv(envKey(key)), readEnv(LEGACY_ENV_KEYS.get(key)));
        if (!runtimeValue.isBlank()) {
            return runtimeValue;
        }
        return properties.getProperty(key, "").trim();
    }

    public String valueOrDefault(String key, String fallback) {
        String value = value(key);
        return value.isBlank() ? fallback : value;
    }

    public int intValue(String key, int fallback) {
        String value = value(key);
        if (value.isBlank()) {
            return fallback;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException exception) {
            return fallback;
        }
    }

    public double doubleValue(String key, double fallback) {
        Double value = optionalDouble(key);
        return value == null ? fallback : value;
    }

    public Double optionalDouble(String key) {
        String value = value(key);
        if (value.isBlank()) {
            return null;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    public Path resolvedPath(String key, String fallback) {
        String rawValue = valueOrDefault(key, fallback);
        Path rawPath = Path.of(rawValue);
        if (rawPath.isAbsolute()) {
            return rawPath.toAbsolutePath().normalize();
        }
        Path parent = path.getParent();
        return (parent == null ? rawPath : parent.resolve(rawPath)).toAbsolutePath().normalize();
    }

    private static String envKey(String key) {
        return key.toUpperCase(Locale.ROOT).replace('.', '_').replace('-', '_');
    }

    private static String readEnv(String key) {
        if (key == null || key.isBlank()) {
            return "";
        }
        return System.getenv(key);
    }

    private static String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first.trim();
        }
        if (second != null && !second.isBlank()) {
            return second.trim();
        }
        return "";
    }
}
