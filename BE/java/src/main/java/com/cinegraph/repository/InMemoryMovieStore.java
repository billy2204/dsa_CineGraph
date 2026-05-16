package com.cinegraph.repository;

import com.cinegraph.domain.Movie;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class InMemoryMovieStore {
    private final List<Movie> movies;
    private final Map<String, Movie> movieById;

    public InMemoryMovieStore(List<Movie> movies) {
        this.movies = List.copyOf(movies);
        this.movieById = new LinkedHashMap<>();
        for (Movie movie : movies) {
            movieById.put(movie.id(), movie);
        }
    }

    public Collection<Movie> allMovies() {
        return movies;
    }

    public Optional<Movie> findById(String id) {
        return Optional.ofNullable(movieById.get(id));
    }

    public boolean contains(String id) {
        return movieById.containsKey(id);
    }

    public int size() {
        return movies.size();
    }
}
