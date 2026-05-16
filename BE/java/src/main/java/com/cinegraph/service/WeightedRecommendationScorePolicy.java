package com.cinegraph.service;

public final class WeightedRecommendationScorePolicy implements RecommendationScorePolicy {
    private final double graphWeight;
    private final double interactionWeight;
    private final double qualityWeight;

    public WeightedRecommendationScorePolicy(double graphWeight, double interactionWeight, double qualityWeight) {
        this.graphWeight = graphWeight;
        this.interactionWeight = interactionWeight;
        this.qualityWeight = qualityWeight;
    }

    @Override
    public double finalScore(double graphSimilarityScore, double interactionScore, double qualityBonus) {
        return graphWeight * graphSimilarityScore
                + interactionWeight * interactionScore
                + qualityWeight * qualityBonus;
    }
}
