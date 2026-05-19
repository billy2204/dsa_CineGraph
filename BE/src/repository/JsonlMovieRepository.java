package repository;

import domain.Movie;
import json.JsonParser;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class JsonlMovieRepository implements MovieRepository {
    private final Path dataPath;

    public JsonlMovieRepository(Path dataPath) {
        this.dataPath = dataPath;
    }

    @Override
    public List<Movie> loadMovies() throws IOException {
        List<Movie> movies = new ArrayList<>();
        try (BufferedReader reader = Files.newBufferedReader(dataPath, StandardCharsets.UTF_8)) {
            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) {
                    continue;
                }
                try {
                    movies.add(MovieMapper.toMovie(JsonParser.parseObject(line)));
                } catch (RuntimeException exception) {
                    throw new IOException("Cannot parse movie JSONL line " + lineNumber, exception);
                }
            }
        }
        return List.copyOf(movies);
    }
}
