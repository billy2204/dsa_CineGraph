package com.cinegraph.graph;

import com.cinegraph.domain.Movie;
import com.cinegraph.index.Normalizer;

import java.util.Collection;
import java.util.List;

public final class GraphBuilder {
    public MovieGraph build(Collection<Movie> movies) {
        MovieGraph graph = new MovieGraph();
        for (Movie movie : movies) {
            String movieNode = MovieGraph.movieNode(movie.id());
            addSingle(graph, movieNode, RelationshipType.DIRECTOR, movie.director());
            addMany(graph, movieNode, RelationshipType.ACTOR, movie.actors());
            addMany(graph, movieNode, RelationshipType.GENRE, movie.genres());
            addMany(graph, movieNode, RelationshipType.KEYWORD, movie.keywords());
            addMany(graph, movieNode, RelationshipType.COUNTRY, movie.countries());
            addMany(graph, movieNode, RelationshipType.LANGUAGE, movie.languages());
            addMany(graph, movieNode, RelationshipType.PRODUCTION_COMPANY, movie.productionCompanies());
        }
        return graph;
    }

    private void addMany(MovieGraph graph, String movieNode, RelationshipType type, List<String> values) {
        for (String value : values) {
            addSingle(graph, movieNode, type, value);
        }
    }

    private void addSingle(MovieGraph graph, String movieNode, RelationshipType type, String value) {
        String normalizedValue = Normalizer.normalize(value);
        if (normalizedValue.isBlank() || "unknown".equals(normalizedValue)) {
            return;
        }
        String metadataNode = type.nodePrefix() + ":" + normalizedValue;
        graph.addUndirectedEdge(movieNode, metadataNode, type, value);
    }
}
