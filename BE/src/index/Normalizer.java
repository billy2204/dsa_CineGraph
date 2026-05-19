package index;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class Normalizer {
    private Normalizer() {
    }

    public static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String withoutMarks = java.text.Normalizer
                .normalize(value, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return withoutMarks
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{IsAlphabetic}\\p{IsDigit}]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    public static List<String> tokens(String value) {
        String normalized = normalize(value);
        if (normalized.isBlank()) {
            return List.of();
        }

        String[] rawTokens = normalized.split("\\s+");
        List<String> tokens = new ArrayList<>(rawTokens.length);
        for (String token : rawTokens) {
            if (!token.isBlank()) {
                tokens.add(token);
            }
        }
        return tokens;
    }

    public static boolean containsNormalized(String source, String query) {
        String normalizedSource = normalize(source);
        String normalizedQuery = normalize(query);
        return !normalizedQuery.isBlank() && normalizedSource.contains(normalizedQuery);
    }
}
