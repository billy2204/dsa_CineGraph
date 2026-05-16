package com.cinegraph.graph;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class MovieGraph {
    private static final String MOVIE_PREFIX = "movie:";

    private final Map<String, List<Edge>> adjacency = new HashMap<>();

    public static String movieNode(String movieId) {
        return MOVIE_PREFIX + movieId;
    }

    public static boolean isMovieNode(String nodeId) {
        return nodeId != null && nodeId.startsWith(MOVIE_PREFIX);
    }

    public static String movieIdFromNode(String nodeId) {
        return nodeId.substring(MOVIE_PREFIX.length());
    }

    public void addUndirectedEdge(String leftNodeId, String rightNodeId, RelationshipType relationshipType, String label) {
        double weight = relationshipType.weight();
        adjacency.computeIfAbsent(leftNodeId, ignored -> new ArrayList<>())
                .add(new Edge(rightNodeId, relationshipType, weight, label));
        adjacency.computeIfAbsent(rightNodeId, ignored -> new ArrayList<>())
                .add(new Edge(leftNodeId, relationshipType, weight, label));
    }

    public List<Edge> neighbors(String nodeId) {
        return adjacency.getOrDefault(nodeId, List.of());
    }

    public int nodeCount() {
        return adjacency.size();
    }

    public int edgeCount() {
        int directedEdges = adjacency.values().stream().mapToInt(List::size).sum();
        return directedEdges / 2;
    }
}
