package com.cinegraph.index;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

public final class InvertedIndex {
    private final Map<String, Map<String, EnumSet<IndexedField>>> postings = new HashMap<>();

    public void addText(String movieId, String text, IndexedField field) {
        for (String token : Normalizer.tokens(text)) {
            addToken(movieId, token, field);
        }
    }

    public void addToken(String movieId, String token, IndexedField field) {
        if (token == null || token.isBlank()) {
            return;
        }
        postings
                .computeIfAbsent(token, ignored -> new HashMap<>())
                .computeIfAbsent(movieId, ignored -> EnumSet.noneOf(IndexedField.class))
                .add(field);
    }

    public Map<String, EnumSet<IndexedField>> find(String token) {
        return postings.getOrDefault(token, Map.of());
    }
}
