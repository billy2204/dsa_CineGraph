package repository;

import domain.Movie;

import java.io.IOException;
import java.util.List;

public interface MovieRepository {
    List<Movie> loadMovies() throws IOException;
}
