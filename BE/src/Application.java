
import config.AppConfig;
import graph.GraphBuilder;
import graph.MovieGraph;
import index.SearchIndex;
import repository.InMemoryMovieStore;
import repository.JsonlMovieRepository;
import repository.MovieRepository;
import repository.PostgresMovieRepository;
import server.ApiServer;
import service.InteractionService;
import service.RecommendationService;
import service.RuntimeRecommendationSettings;
import service.SearchService;

import java.nio.file.Path;

public final class Application {
    private Application() {
    }

    public static void main(String[] args) throws Exception {
        AppConfig config = AppConfig.load(resolveConfigPath(args));
        RepositorySelection repositorySelection = resolveRepository(args, config);
        int port = config.intValue("server.port", 8080);

        InMemoryMovieStore movieStore = new InMemoryMovieStore(repositorySelection.repository().loadMovies());
        SearchIndex searchIndex = SearchIndex.build(movieStore.allMovies());
        MovieGraph graph = new GraphBuilder().build(movieStore.allMovies());
        RuntimeRecommendationSettings recommendationSettings = new RuntimeRecommendationSettings(config);
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
        System.out.println("Config: " + config.path());
        System.out.println("Data source: " + repositorySelection.description());
        System.out.println("Movies: " + movieStore.size());
        System.out.println("Graph: " + graph.nodeCount() + " nodes, " + graph.edgeCount() + " edges");
        System.out.println("URL: http://localhost:" + port + "/api/health");
    }

    private static Path resolveConfigPath(String[] args) {
        for (int index = 0; index < args.length - 1; index++) {
            if ("--config".equals(args[index])) {
                return Path.of(args[index + 1]).toAbsolutePath().normalize();
            }
        }

        String rawPath = System.getenv("CONFIG_PATH");
        if (rawPath == null || rawPath.isBlank()) {
            rawPath = "BE/config.properties";
        }
        return Path.of(rawPath).toAbsolutePath().normalize();
    }

    private static RepositorySelection resolveRepository(String[] args, AppConfig config) {
        String jsonlPath = jsonlPathArg(args);
        if (!jsonlPath.isBlank()) {
            Path path = Path.of(jsonlPath).toAbsolutePath().normalize();
            return new RepositorySelection(new JsonlMovieRepository(path), "JSONL " + path);
        }

        if (args.length > 0 && !args[0].isBlank() && !args[0].startsWith("--")) {
            Path path = Path.of(args[0]).toAbsolutePath().normalize();
            return new RepositorySelection(new JsonlMovieRepository(path), "JSONL " + path);
        }

        if ("jsonl".equalsIgnoreCase(config.valueOrDefault("movie.source", "jsonl"))) {
            Path path = config.resolvedPath("movie.data.path", "final_movie_catalog.jsonl");
            return new RepositorySelection(new JsonlMovieRepository(path), "JSONL " + path);
        }

        return new RepositorySelection(new PostgresMovieRepository(config), "PostgreSQL via " + config.path());
    }

    private static String jsonlPathArg(String[] args) {
        for (int index = 0; index < args.length - 1; index++) {
            if ("--jsonl".equals(args[index])) {
                return args[index + 1];
            }
        }
        return "";
    }

    private record RepositorySelection(MovieRepository repository, String description) {
    }
}
