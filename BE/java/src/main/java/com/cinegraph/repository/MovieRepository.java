package com.cinegraph.repository;

import com.cinegraph.domain.Movie;

import java.io.IOException;
import java.util.List;

public interface MovieRepository {
    List<Movie> loadMovies() throws IOException;
}
