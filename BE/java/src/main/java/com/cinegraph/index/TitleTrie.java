package com.cinegraph.index;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class TitleTrie {
    private final Node root = new Node();

    public void insert(String title, String movieId) {
        String normalizedTitle = Normalizer.normalize(title);
        if (normalizedTitle.isBlank()) {
            return;
        }

        Node current = root;
        for (char character : normalizedTitle.toCharArray()) {
            current = current.children.computeIfAbsent(character, ignored -> new Node());
        }
        current.movieIds.add(movieId);
    }

    public List<String> searchPrefix(String prefix, int limit) {
        String normalizedPrefix = Normalizer.normalize(prefix);
        if (normalizedPrefix.isBlank()) {
            return List.of();
        }

        Node current = root;
        for (char character : normalizedPrefix.toCharArray()) {
            current = current.children.get(character);
            if (current == null) {
                return List.of();
            }
        }

        List<String> results = new ArrayList<>();
        collect(current, results, limit);
        return results;
    }

    private void collect(Node node, List<String> results, int limit) {
        if (results.size() >= limit) {
            return;
        }
        for (String movieId : node.movieIds) {
            if (results.size() >= limit) {
                return;
            }
            results.add(movieId);
        }
        for (Node child : node.children.values()) {
            collect(child, results, limit);
            if (results.size() >= limit) {
                return;
            }
        }
    }

    private static final class Node {
        private final Map<Character, Node> children = new HashMap<>();
        private final Set<String> movieIds = new LinkedHashSet<>();
    }
}
