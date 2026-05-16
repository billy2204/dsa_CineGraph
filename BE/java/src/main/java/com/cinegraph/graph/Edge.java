package com.cinegraph.graph;

public record Edge(String targetNodeId, RelationshipType relationshipType, double weight, String label) {
}
