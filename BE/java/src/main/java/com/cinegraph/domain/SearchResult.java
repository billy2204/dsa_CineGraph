package com.cinegraph.domain;

import java.util.List;

public record SearchResult(Movie movie, double score, List<String> matchReasons) {
    public SearchResult {
        matchReasons = List.copyOf(matchReasons == null ? List.of() : matchReasons);
    }
}
