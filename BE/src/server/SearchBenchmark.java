package server;

public final class SearchBenchmark {
    private final long startNs;

    private SearchBenchmark(long startNs) {
        this.startNs = startNs;
    }

    public static SearchBenchmark start() {
        return new SearchBenchmark(System.nanoTime());
    }

    public long elapsedMillis() {
        long elapsedNs = System.nanoTime() - startNs;
        if (elapsedNs <= 0) {
            return 0;
        }
        // Tra ve thoi gian xu ly tinh theo mili-giay.
        return elapsedNs / 1_000_000L;
    }
}
