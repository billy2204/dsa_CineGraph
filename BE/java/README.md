# CineGraph Java Backend

Plain Java backend for the Graph-Based Movie Search Engine. It avoids external dependencies so the DSA parts stay visible: `HashMap`, trie, inverted index, adjacency-list graph, BFS-like shared-neighbor traversal, priority queue, weighted scoring, and score normalization.

## Run

From the repository root:

```bash
javac -d BE/java/out $(find BE/java/src/main/java -name '*.java')
java -cp BE/java/out com.cinegraph.Application
```

Optional:

```bash
PORT=9090 MOVIE_DATA_PATH=BE/final_movie_catalog.jsonl java -cp BE/java/out com.cinegraph.Application
```

## API

- `GET /api/health`
- `GET /api/movies?limit=50&offset=0`
- `GET /api/movies/{movie_id}`
- `GET /api/search?q=nolan%20sci-fi&genre=Drama&minYear=2000&minRating=7&limit=12`
- `GET /api/recommendations?seed_movie_id={movie_id}&threshold=70&limit=10`
- `GET /api/recommendations?seed=red%20rain&threshold=70&limit=10`
- `GET /api/recommendation-settings`
- `POST /api/recommendation-settings`
- `POST /api/interactions/search`
- `POST /api/interactions/click`
- `POST /api/interactions/view`
- `POST /api/interactions/favorite`
- `POST /api/interactions/watchlist`
- `POST /api/interactions/rating`

Example interaction payload:

```json
{
  "user_id": "user-123",
  "movie_id": "movie:inception:5b189f219a"
}
```

Rating payload:

```json
{
  "user_id": "user-123",
  "movie_id": "movie:inception:5b189f219a",
  "rating": 9
}
```

Runtime recommendation settings can be updated without restarting the server:

```json
{
  "graph_weight": 0.65,
  "interaction_weight": 0.25,
  "quality_weight": 0.10,
  "user_interaction_blend": 0.80,
  "relationship_weights": {
    "director": 6,
    "actor": 4,
    "genre": 2.5,
    "keyword": 2
  }
}
```

Recommendations can use user-specific interaction state:

```bash
curl "http://localhost:8080/api/recommendations?seed_movie_id=movie:inception:5b189f219a&user_id=user-123&threshold=70"
```
