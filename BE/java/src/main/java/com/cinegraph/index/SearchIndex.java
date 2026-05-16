package com.cinegraph.index;

import com.cinegraph.domain.Movie;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public final class SearchIndex {
    private final Map<String, String> titleIndex;
    private final TitleTrie titleTrie;
    private final InvertedIndex invertedIndex;

    private SearchIndex(Map<String, String> titleIndex, TitleTrie titleTrie, InvertedIndex invertedIndex) {
        this.titleIndex = Map.copyOf(titleIndex);
        this.titleTrie = titleTrie;
        this.invertedIndex = invertedIndex;
    }

    public static SearchIndex build(Collection<Movie> movies) {
        Map<String, String> titleIndex = new HashMap<>();
        TitleTrie titleTrie = new TitleTrie();
        InvertedIndex invertedIndex = new InvertedIndex();

        for (Movie movie : movies) {
            String normalizedTitle = Normalizer.normalize(movie.title());
            if (!normalizedTitle.isBlank()) {
                titleIndex.put(normalizedTitle, movie.id());
                titleTrie.insert(movie.title(), movie.id());
                invertedIndex.addText(movie.id(), movie.title(), IndexedField.TITLE);
            }

            invertedIndex.addText(movie.id(), movie.director(), IndexedField.DIRECTOR);
            movie.actors().forEach(actor -> invertedIndex.addText(movie.id(), actor, IndexedField.ACTOR));
            movie.genres().forEach(genre -> invertedIndex.addText(movie.id(), genre, IndexedField.GENRE));
            movie.keywords().forEach(keyword -> invertedIndex.addText(movie.id(), keyword, IndexedField.KEYWORD));
            movie.countries().forEach(country -> invertedIndex.addText(movie.id(), country, IndexedField.COUNTRY));
            movie.languages().forEach(language -> invertedIndex.addText(movie.id(), language, IndexedField.LANGUAGE));
            invertedIndex.addText(movie.id(), movie.type(), IndexedField.TYPE);
            invertedIndex.addText(movie.id(), movie.description(), IndexedField.DESCRIPTION);
            if (movie.releaseYear() > 0) {
                invertedIndex.addToken(movie.id(), String.valueOf(movie.releaseYear()), IndexedField.YEAR);
            }
        }

        return new SearchIndex(titleIndex, titleTrie, invertedIndex);
    }

    public Optional<String> exactTitle(String query) {
        return Optional.ofNullable(titleIndex.get(Normalizer.normalize(query)));
    }

    public TitleTrie titleTrie() {
        return titleTrie;
    }

    public InvertedIndex invertedIndex() {
        return invertedIndex;
    }
}
