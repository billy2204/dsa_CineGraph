package com.cinegraph;

import com.cinegraph.graph.GraphBuilder;
import com.cinegraph.graph.MovieGraph;
import com.cinegraph.index.SearchIndex;
import com.cinegraph.repository.InMemoryMovieStore;
import com.cinegraph.repository.JsonlMovieRepository;
import com.cinegraph.repository.MovieRepository;
import com.cinegraph.server.ApiServer;
import com.cinegraph.service.InteractionService;
import com.cinegraph.service.RecommendationService;
import com.cinegraph.service.RuntimeRecommendationSettings;
import com.cinegraph.service.SearchService;

import java.nio.file.Files;
import java.nio.file.Path;

public final class Application {
    private Application() {
    }

    public static void main(String[] args) throws Exception {
        Path dataPath = resolveDataPath(args);
        int port = resolvePort();

        MovieRepository repository = new JsonlMovieRepository(dataPath);
        InMemoryMovieStore movieStore = new InMemoryMovieStore(repository.loadMovies());
        SearchIndex searchIndex = SearchIndex.build(movieStore.allMovies());
        MovieGraph graph = new GraphBuilder().build(movieStore.allMovies());
        RuntimeRecommendationSettings recommendationSettings = new RuntimeRecommendationSettings();
        InteractionService interactionService = new InteractionService(recommendationSettings);

        SearchService searchService = new SearchService(movieStore, searchIndex);
        RecommendationService recommendationService = new RecommendationService(movieStore, graph, interactionService, recommendationSettings);
        ApiServer apiServer = new ApiServer(
                port,
                movieStore,
                graph,
                searchService,
                recommendationService,
                interactionService,
                recommendationSettings
        );
        apiServer.start();

        System.out.println("CineGraph Java API is running");
        System.out.println("Data: " + dataPath.toAbsolutePath());
        System.out.println("Movies: " + movieStore.size());
        System.out.println("Graph: " + graph.nodeCount() + " nodes, " + graph.edgeCount() + " edges");
        System.out.println("URL: http://localhost:" + port + "/api/health");
    }

    private static Path resolveDataPath(String[] args) {
        if (args.length > 0 && !args[0].isBlank()) {
            return Path.of(args[0]).toAbsolutePath().normalize();
        }
        String envPath = System.getenv("MOVIE_DATA_PATH");
        if (envPath != null && !envPath.isBlank()) {
            return Path.of(envPath).toAbsolutePath().normalize();
        }

        for (Path candidate : defaultDataCandidates()) {
            if (Files.exists(candidate)) {
                return candidate.toAbsolutePath().normalize();
            }
        }
        return Path.of("BE/final_movie_catalog.jsonl").toAbsolutePath().normalize();
    }

    private static Path[] defaultDataCandidates() {
        return new Path[]{
                Path.of("BE/final_movie_catalog.jsonl"),
                Path.of("../final_movie_catalog.jsonl"),
                Path.of("../../final_movie_catalog.jsonl")
        };
    }

    private static int resolvePort() {
        String rawPort = System.getenv("PORT");
        if (rawPort == null || rawPort.isBlank()) {
            return 8080;
        }
        try {
            return Integer.parseInt(rawPort);
        } catch (NumberFormatException exception) {
            return 8080;
        }
    }
}
