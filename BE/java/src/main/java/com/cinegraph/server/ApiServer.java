package com.cinegraph.server;

import com.cinegraph.domain.Movie;
import com.cinegraph.domain.Recommendation;
import com.cinegraph.domain.SearchFilters;
import com.cinegraph.domain.SearchResult;
import com.cinegraph.graph.RelationshipType;
import com.cinegraph.graph.MovieGraph;
import com.cinegraph.json.JsonParser;
import com.cinegraph.json.JsonWriter;
import com.cinegraph.repository.InMemoryMovieStore;
import com.cinegraph.service.InteractionService;
import com.cinegraph.service.RecommendationService;
import com.cinegraph.service.RuntimeRecommendationSettings;
import com.cinegraph.service.SearchService;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;

public final class ApiServer {
    private final int port;
    private final InMemoryMovieStore movieStore;
    private final MovieGraph graph;
    private final SearchService searchService;
    private final RecommendationService recommendationService;
    private final InteractionService interactionService;
    private final RuntimeRecommendationSettings recommendationSettings;

    public ApiServer(
            int port,
            InMemoryMovieStore movieStore,
            MovieGraph graph,
            SearchService searchService,
            RecommendationService recommendationService,
            InteractionService interactionService,
            RuntimeRecommendationSettings recommendationSettings
    ) {
        this.port = port;
        this.movieStore = movieStore;
        this.graph = graph;
        this.searchService = searchService;
        this.recommendationService = recommendationService;
        this.interactionService = interactionService;
        this.recommendationSettings = recommendationSettings;
    }

    public void start() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/health", this::handleHealth);
        server.createContext("/api/search", this::handleSearch);
        server.createContext("/api/movies", this::handleMovies);
        server.createContext("/api/recommendations", this::handleRecommendations);
        server.createContext("/api/recommendation-settings", this::handleRecommendationSettings);
        server.createContext("/api/interactions", this::handleInteractions);
        server.setExecutor(Executors.newFixedThreadPool(Math.max(4, Runtime.getRuntime().availableProcessors())));
        server.start();
    }

    private void handleHealth(HttpExchange exchange) throws IOException {
        if (preflight(exchange)) {
            return;
        }
        if (!"GET".equals(exchange.getRequestMethod())) {
            sendError(exchange, 405, "Method not allowed");
            return;
        }
        sendJson(exchange, 200, Map.of(
                "status", "ok",
                "movies", movieStore.size(),
                "graph_nodes", graph.nodeCount(),
                "graph_edges", graph.edgeCount()
        ));
    }

    private void handleSearch(HttpExchange exchange) throws IOException {
        if (preflight(exchange)) {
            return;
        }
        if (!"GET".equals(exchange.getRequestMethod())) {
            sendError(exchange, 405, "Method not allowed");
            return;
        }

        Map<String, String> params = queryParams(exchange.getRequestURI());
        String query = params.getOrDefault("q", "");
        String userId = params.getOrDefault("user_id", "");
        SearchFilters filters = filtersFrom(params);
        List<SearchResult> results = searchService.search(query, filters);
        interactionService.recordSearch(userId, query, results.stream().map(result -> result.movie().id()).toList());

        sendJson(exchange, 200, Map.of(
                "query", query,
                "count", results.size(),
                "items", results.stream().map(this::searchResultMap).toList()
        ));
    }

    private void handleMovies(HttpExchange exchange) throws IOException {
        if (preflight(exchange)) {
            return;
        }
        if (!"GET".equals(exchange.getRequestMethod())) {
            sendError(exchange, 405, "Method not allowed");
            return;
        }

        String path = exchange.getRequestURI().getPath();
        if ("/api/movies".equals(path) || "/api/movies/".equals(path)) {
            Map<String, String> params = queryParams(exchange.getRequestURI());
            int limit = intParam(params, "limit", 50);
            int offset = intParam(params, "offset", 0);
            List<Map<String, Object>> items = movieStore.allMovies().stream()
                    .skip(Math.max(0, offset))
                    .limit(Math.max(1, limit))
                    .map(this::movieMap)
                    .toList();
            sendJson(exchange, 200, Map.of(
                    "count", movieStore.size(),
                    "offset", offset,
                    "limit", limit,
                    "items", items
            ));
            return;
        }

        String encodedId = path.substring("/api/movies/".length());
        String movieId = decode(encodedId);
        String userId = queryParams(exchange.getRequestURI()).getOrDefault("user_id", "");
        movieStore.findById(movieId).ifPresentOrElse(movie -> {
            try {
                interactionService.recordView(userId, movie.id());
                sendJson(exchange, 200, movieMap(movie));
            } catch (IOException exception) {
                throw new RuntimeException(exception);
            }
        }, () -> sendErrorUnchecked(exchange, 404, "Movie not found: " + movieId));
    }

    private void handleRecommendations(HttpExchange exchange) throws IOException {
        if (preflight(exchange)) {
            return;
        }
        if (!"GET".equals(exchange.getRequestMethod())) {
            sendError(exchange, 405, "Method not allowed");
            return;
        }

        Map<String, String> params = queryParams(exchange.getRequestURI());
        String seedMovieId = firstPresent(params, "seed_movie_id", "seedMovieId", "movie_id");
        if (seedMovieId.isBlank() && params.containsKey("seed")) {
            List<SearchResult> seedResults = searchService.search(params.get("seed"), SearchFilters.empty(1));
            if (!seedResults.isEmpty()) {
                seedMovieId = seedResults.get(0).movie().id();
            }
        }
        if (seedMovieId.isBlank()) {
            sendError(exchange, 400, "Missing seed_movie_id or seed query");
            return;
        }

        int threshold = Math.max(0, Math.min(100, intParam(params, "threshold", 60)));
        int limit = Math.max(1, intParam(params, "limit", 10));
        String userId = params.getOrDefault("user_id", "");
        try {
            List<Recommendation> recommendations = recommendationService.recommend(seedMovieId, threshold, limit, userId);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("seed_movie_id", seedMovieId);
            response.put("threshold", threshold);
            response.put("count", recommendations.size());
            response.put("items", recommendations.stream().map(this::recommendationMap).toList());
            if (recommendations.isEmpty()) {
                response.put("message", "No recommendations found with the current threshold. Try lowering the minimum match score.");
            }
            sendJson(exchange, 200, response);
        } catch (IllegalArgumentException exception) {
            sendError(exchange, 404, exception.getMessage());
        }
    }

    private void handleRecommendationSettings(HttpExchange exchange) throws IOException {
        if (preflight(exchange)) {
            return;
        }

        if ("GET".equals(exchange.getRequestMethod())) {
            sendJson(exchange, 200, recommendationSettings.asMap());
            return;
        }

        if (!"POST".equals(exchange.getRequestMethod())) {
            sendError(exchange, 405, "Method not allowed");
            return;
        }

        Map<String, Object> body = readJsonObject(exchange);
        recommendationSettings.update(
                optionalDoubleBody(body, "graph_weight", "graphWeight"),
                optionalDoubleBody(body, "interaction_weight", "interactionWeight"),
                optionalDoubleBody(body, "quality_weight", "qualityWeight"),
                optionalDoubleBody(body, "user_interaction_blend", "userInteractionBlend"),
                relationshipWeights(body.get("relationship_weights"))
        );
        sendJson(exchange, 200, recommendationSettings.asMap());
    }

    private void handleInteractions(HttpExchange exchange) throws IOException {
        if (preflight(exchange)) {
            return;
        }
        if (!"POST".equals(exchange.getRequestMethod())) {
            sendError(exchange, 405, "Method not allowed");
            return;
        }

        Map<String, Object> body = readJsonObject(exchange);
        String path = exchange.getRequestURI().getPath();
        String action = path.substring("/api/interactions/".length());

        if ("search".equals(action)) {
            interactionService.recordSearch(stringBody(body, "user_id"), stringBody(body, "query"), List.of());
            sendJson(exchange, 200, Map.of("ok", true));
            return;
        }

        String movieId = firstPresentBody(body, "movie_id", "movieId");
        if (!movieStore.contains(movieId)) {
            sendError(exchange, 404, "Movie not found: " + movieId);
            return;
        }

        String userId = firstPresentBody(body, "user_id", "userId");
        switch (action) {
            case "click" -> interactionService.recordClick(userId, movieId);
            case "view" -> interactionService.recordView(userId, movieId);
            case "favorite" -> interactionService.recordFavorite(userId, movieId);
            case "watchlist" -> interactionService.recordWatchlist(userId, movieId);
            case "rating" -> interactionService.recordRating(userId, movieId, doubleBody(body, "rating", 0));
            default -> {
                sendError(exchange, 404, "Unknown interaction action: " + action);
                return;
            }
        }
        sendJson(exchange, 200, Map.of("ok", true, "movie_id", movieId, "action", action));
    }

    private SearchFilters filtersFrom(Map<String, String> params) {
        Integer year = optionalInt(params, "year");
        Integer minYear = optionalInt(params, "minYear");
        Integer maxYear = optionalInt(params, "maxYear");
        Double minRating = optionalDouble(params, "minRating");
        if (minRating == null) {
            minRating = optionalDouble(params, "rating");
        }
        return new SearchFilters(
                params.getOrDefault("genre", ""),
                year != null ? year : minYear,
                year != null ? year : maxYear,
                minRating,
                params.getOrDefault("actor", ""),
                params.getOrDefault("director", ""),
                params.getOrDefault("language", ""),
                params.getOrDefault("country", ""),
                params.getOrDefault("type", ""),
                intParam(params, "limit", 12)
        );
    }

    private Map<String, Object> movieMap(Movie movie) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", movie.id());
        map.put("movie_id", movie.id());
        map.put("title", movie.title());
        map.put("original_title", movie.originalTitle());
        map.put("type", movie.type());
        map.put("year", movie.releaseYear());
        map.put("release_year", movie.releaseYear());
        map.put("release_date", movie.releaseDate());
        map.put("rating", movie.voteAverage());
        map.put("vote_average", movie.voteAverage());
        map.put("vote_count", movie.voteCount());
        map.put("popularity", movie.popularity());
        map.put("trend_score", movie.trendScore());
        map.put("runtime_minutes", movie.runtimeMinutes());
        map.put("duration", movie.runtimeMinutes());
        map.put("maturity_rating", movie.maturityRating());
        map.put("director", movie.director());
        map.put("actors", movie.actors());
        map.put("genres", movie.genres());
        map.put("keywords", movie.keywords());
        map.put("countries", movie.countries());
        map.put("languages", movie.languages());
        map.put("production_companies", movie.productionCompanies());
        map.put("description", movie.description());
        map.put("data_quality_score", movie.dataQualityScore());
        return map;
    }

    private Map<String, Object> searchResultMap(SearchResult result) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("movie", movieMap(result.movie()));
        map.put("score", round(result.score()));
        map.put("search_score", round(result.score()));
        map.put("match_reasons", result.matchReasons());
        return map;
    }

    private Map<String, Object> recommendationMap(Recommendation recommendation) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("movie", movieMap(recommendation.movie()));
        map.put("movie_id", recommendation.movie().id());
        map.put("title", recommendation.movie().title());
        map.put("normalized_final_recommendation_score", round(recommendation.normalizedScore()));
        map.put("score", round(recommendation.normalizedScore()));
        map.put("graph_similarity_score", round(recommendation.graphSimilarityScore()));
        map.put("interaction_score", round(recommendation.interactionScore()));
        map.put("quality_bonus", round(recommendation.qualityBonus()));
        map.put("raw_final_score", round(recommendation.rawFinalScore()));
        map.put("reasons", recommendation.reasons());
        map.put("explanation", recommendation.reasons().isEmpty() ? "" : recommendation.reasons().get(0));
        return map;
    }

    private Map<String, String> queryParams(URI uri) {
        Map<String, String> params = new LinkedHashMap<>();
        String rawQuery = uri.getRawQuery();
        if (rawQuery == null || rawQuery.isBlank()) {
            return params;
        }
        for (String pair : rawQuery.split("&")) {
            int equalsIndex = pair.indexOf('=');
            if (equalsIndex < 0) {
                params.put(decode(pair), "");
            } else {
                params.put(decode(pair.substring(0, equalsIndex)), decode(pair.substring(equalsIndex + 1)));
            }
        }
        return params;
    }

    private Map<String, Object> readJsonObject(HttpExchange exchange) throws IOException {
        try (InputStream body = exchange.getRequestBody()) {
            String text = new String(body.readAllBytes(), StandardCharsets.UTF_8);
            if (text.isBlank()) {
                return Map.of();
            }
            return JsonParser.parseObject(text);
        }
    }

    private boolean preflight(HttpExchange exchange) throws IOException {
        addCors(exchange);
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return true;
        }
        return false;
    }

    private void sendJson(HttpExchange exchange, int status, Object body) throws IOException {
        addCors(exchange);
        byte[] payload = JsonWriter.write(body).getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(status, payload.length);
        try (OutputStream responseBody = exchange.getResponseBody()) {
            responseBody.write(payload);
        }
    }

    private void sendError(HttpExchange exchange, int status, String message) throws IOException {
        sendJson(exchange, status, Map.of("error", message));
    }

    private void sendErrorUnchecked(HttpExchange exchange, int status, String message) {
        try {
            sendError(exchange, status, message);
        } catch (IOException exception) {
            throw new RuntimeException(exception);
        }
    }

    private void addCors(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    private String firstPresent(Map<String, String> params, String... keys) {
        for (String key : keys) {
            String value = params.get(key);
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private String firstPresentBody(Map<String, Object> body, String... keys) {
        for (String key : keys) {
            String value = stringBody(body, key);
            if (!value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private String stringBody(Map<String, Object> body, String key) {
        Object value = body.get(key);
        return value == null ? "" : String.valueOf(value);
    }

    private double doubleBody(Map<String, Object> body, String key, double fallback) {
        Object value = body.get(key);
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        try {
            return value == null ? fallback : Double.parseDouble(String.valueOf(value));
        } catch (NumberFormatException exception) {
            return fallback;
        }
    }

    private Double optionalDoubleBody(Map<String, Object> body, String... keys) {
        for (String key : keys) {
            Object value = body.get(key);
            if (value instanceof Number number) {
                return number.doubleValue();
            }
            if (value == null) {
                continue;
            }
            try {
                return Double.parseDouble(String.valueOf(value));
            } catch (NumberFormatException ignored) {
                // Keep trying aliases.
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<RelationshipType, Double> relationshipWeights(Object rawValue) {
        if (!(rawValue instanceof Map<?, ?> rawMap)) {
            return Map.of();
        }

        EnumMap<RelationshipType, Double> weights = new EnumMap<>(RelationshipType.class);
        for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
            RelationshipType type = relationshipType(String.valueOf(entry.getKey()));
            Double value = numericValue(entry.getValue());
            if (type != null && value != null) {
                weights.put(type, value);
            }
        }
        return weights;
    }

    private RelationshipType relationshipType(String rawType) {
        String normalized = rawType == null ? "" : rawType.trim().replace('-', '_').toUpperCase();
        if ("PRODUCTION".equals(normalized) || "COMPANY".equals(normalized)) {
            normalized = "PRODUCTION_COMPANY";
        }
        try {
            return RelationshipType.valueOf(normalized);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private Double numericValue(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value == null) {
            return null;
        }
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private Integer optionalInt(Map<String, String> params, String key) {
        if (!params.containsKey(key) || params.get(key).isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(params.get(key));
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private Double optionalDouble(Map<String, String> params, String key) {
        if (!params.containsKey(key) || params.get(key).isBlank()) {
            return null;
        }
        try {
            return Double.parseDouble(params.get(key));
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private int intParam(Map<String, String> params, String key, int fallback) {
        Integer value = optionalInt(params, key);
        return value == null ? fallback : value;
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
