package com.cinegraph.index;

public enum IndexedField {
    TITLE(35, "Title"),
    DIRECTOR(50, "Director"),
    ACTOR(40, "Actor"),
    GENRE(30, "Genre"),
    KEYWORD(25, "Keyword"),
    DESCRIPTION(10, "Description"),
    YEAR(20, "Year"),
    COUNTRY(12, "Country"),
    LANGUAGE(12, "Language"),
    TYPE(8, "Type");

    private final int searchWeight;
    private final String reasonLabel;

    IndexedField(int searchWeight, String reasonLabel) {
        this.searchWeight = searchWeight;
        this.reasonLabel = reasonLabel;
    }

    public int searchWeight() {
        return searchWeight;
    }

    public String reasonLabel() {
        return reasonLabel;
    }
}
