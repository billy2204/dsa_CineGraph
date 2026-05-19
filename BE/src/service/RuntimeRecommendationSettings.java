package service;

import config.AppConfig;
import graph.RelationshipType;

import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

public final class RuntimeRecommendationSettings implements RecommendationScorePolicy {
    private final AtomicReference<Snapshot> snapshot;

    public RuntimeRecommendationSettings() {
        this.snapshot = new AtomicReference<>(Snapshot.defaults());
    }

    public RuntimeRecommendationSettings(AppConfig config) {
        this.snapshot = new AtomicReference<>(Snapshot.fromConfig(config));
    }

    @Override
    public double finalScore(double graphSimilarityScore, double interactionScore, double qualityBonus) {
        Snapshot current = snapshot.get();
        return current.graphWeight * graphSimilarityScore
                + current.interactionWeight * interactionScore
                + current.qualityWeight * qualityBonus;
    }

    public double relationshipWeight(RelationshipType type) {
        return snapshot.get().relationshipWeights.getOrDefault(type, type.weight());
    }

    public double userInteractionBlend() {
        return snapshot.get().userInteractionBlend;
    }

    public Map<String, Object> asMap() {
        Snapshot current = snapshot.get();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("graph_weight", current.graphWeight);
        map.put("interaction_weight", current.interactionWeight);
        map.put("quality_weight", current.qualityWeight);
        map.put("user_interaction_blend", current.userInteractionBlend);

        Map<String, Object> relationshipWeights = new LinkedHashMap<>();
        for (RelationshipType type : RelationshipType.values()) {
            relationshipWeights.put(type.name().toLowerCase(), current.relationshipWeights.getOrDefault(type, type.weight()));
        }
        map.put("relationship_weights", relationshipWeights);
        return map;
    }

    public void update(
            Double graphWeight,
            Double interactionWeight,
            Double qualityWeight,
            Double userInteractionBlend,
            Map<RelationshipType, Double> relationshipWeights
    ) {
        snapshot.updateAndGet(current -> {
            EnumMap<RelationshipType, Double> nextRelationshipWeights = new EnumMap<>(current.relationshipWeights);
            if (relationshipWeights != null) {
                relationshipWeights.forEach((type, value) -> {
                    if (value != null && value >= 0) {
                        nextRelationshipWeights.put(type, value);
                    }
                });
            }

            return new Snapshot(
                    positiveOrCurrent(graphWeight, current.graphWeight),
                    positiveOrCurrent(interactionWeight, current.interactionWeight),
                    positiveOrCurrent(qualityWeight, current.qualityWeight),
                    clampBlend(userInteractionBlend, current.userInteractionBlend),
                    nextRelationshipWeights
            );
        });
    }

    private double positiveOrCurrent(Double value, double current) {
        return value == null || value < 0 ? current : value;
    }

    private double clampBlend(Double value, double current) {
        if (value == null) {
            return current;
        }
        return Math.max(0, Math.min(1, value));
    }

    private record Snapshot(
            double graphWeight,
            double interactionWeight,
            double qualityWeight,
            double userInteractionBlend,
            EnumMap<RelationshipType, Double> relationshipWeights
    ) {
        private static Snapshot defaults() {
            EnumMap<RelationshipType, Double> weights = new EnumMap<>(RelationshipType.class);
            for (RelationshipType type : RelationshipType.values()) {
                weights.put(type, type.weight());
            }
            return new Snapshot(0.60, 0.30, 0.10, 0.70, weights);
        }

        private static Snapshot fromConfig(AppConfig config) {
            Snapshot defaults = defaults();
            EnumMap<RelationshipType, Double> weights = new EnumMap<>(defaults.relationshipWeights);
            for (RelationshipType type : RelationshipType.values()) {
                Double configuredWeight = config.optionalDouble("recommendation.relationship." + type.name().toLowerCase());
                if (configuredWeight != null && configuredWeight >= 0) {
                    weights.put(type, configuredWeight);
                }
            }

            return new Snapshot(
                    config.doubleValue("recommendation.graph_weight", defaults.graphWeight),
                    config.doubleValue("recommendation.interaction_weight", defaults.interactionWeight),
                    config.doubleValue("recommendation.quality_weight", defaults.qualityWeight),
                    Math.max(0, Math.min(1, config.doubleValue("recommendation.user_interaction_blend", defaults.userInteractionBlend))),
                    weights
            );
        }

        private Snapshot {
            relationshipWeights = new EnumMap<>(relationshipWeights);
        }
    }
}
