package graph;

public enum RelationshipType {
    DIRECTOR("director", 5.0, "Same director"),
    ACTOR("actor", 4.0, "Same actor"),
    GENRE("genre", 3.0, "Same genre"),
    KEYWORD("keyword", 2.0, "Shared keyword"),
    COUNTRY("country", 1.0, "Same country"),
    LANGUAGE("language", 1.0, "Same language"),
    PRODUCTION_COMPANY("company", 1.0, "Same production company");

    private final String nodePrefix;
    private final double weight;
    private final String reasonLabel;

    RelationshipType(String nodePrefix, double weight, String reasonLabel) {
        this.nodePrefix = nodePrefix;
        this.weight = weight;
        this.reasonLabel = reasonLabel;
    }

    public String nodePrefix() {
        return nodePrefix;
    }

    public double weight() {
        return weight;
    }

    public String reasonLabel() {
        return reasonLabel;
    }
}
