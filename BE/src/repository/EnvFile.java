package repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

final class EnvFile {
    private final Path path;
    private final Map<String, String> values;

    private EnvFile(Path path, Map<String, String> values) {
        this.path = path;
        this.values = values;
    }

    static EnvFile load(Path path) throws IOException {
        Path absolutePath = path.toAbsolutePath().normalize();
        if (!Files.exists(absolutePath)) {
            throw new IOException("Cannot find env file: " + absolutePath);
        }

        Map<String, String> values = new LinkedHashMap<>();
        for (String rawLine : Files.readAllLines(absolutePath)) {
            String line = rawLine.trim();
            if (line.isBlank() || line.startsWith("#") || !line.contains("=")) {
                continue;
            }
            int equalsIndex = line.indexOf('=');
            String key = line.substring(0, equalsIndex).trim();
            String value = stripQuotes(line.substring(equalsIndex + 1).trim());
            values.put(key, value);
        }
        return new EnvFile(absolutePath, values);
    }

    String value(String key) {
        String runtimeValue = System.getenv(key);
        if (runtimeValue != null && !runtimeValue.isBlank()) {
            return runtimeValue;
        }
        return values.getOrDefault(key, "");
    }

    String valueOrDefault(String key, String fallback) {
        String value = value(key);
        return value.isBlank() ? fallback : value;
    }

    String resolvedPath(String key) {
        String rawValue = value(key);
        if (rawValue.isBlank()) {
            return "";
        }
        Path rawPath = Path.of(rawValue).toAbsolutePath().normalize();
        if (Path.of(rawValue).isAbsolute()) {
            return rawPath.toString();
        }
        return path.getParent().resolve(rawValue).toAbsolutePath().normalize().toString();
    }

    private static String stripQuotes(String value) {
        if (value.length() >= 2) {
            char first = value.charAt(0);
            char last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                return value.substring(1, value.length() - 1);
            }
        }
        return value;
    }
}
