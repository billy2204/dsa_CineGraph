package service;

public interface RecommendationScorePolicy {
    double finalScore(double graphSimilarityScore, double interactionScore, double qualityBonus);
}
