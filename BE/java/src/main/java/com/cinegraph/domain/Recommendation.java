package com.cinegraph.domain;

import java.util.List;

public record Recommendation(
        Movie movie,
        double normalizedScore,
        double graphSimilarityScore,
        double interactionScore,
        double qualityBonus,
        double rawFinalScore,
        List<String> reasons
) {
    public Recommendation {
        reasons = List.copyOf(reasons == null ? List.of() : reasons);
    }
}
