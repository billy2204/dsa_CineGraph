# CineGraph - Graph-Based Movie Search Engine

CineGraph la project Search Engine / Recommendation Engine cho phim, tap trung vao Data Structures and Algorithms thay vi chi CRUD. He thong dung movie metadata nhu actor, genre, director, keyword de search va recommend phim co lien quan.

Core idea:

```text
Movie data
  -> normalized relational data
  -> in-memory indexes
  -> in-memory graph adjacency list
  -> search ranking + graph recommendation
```

## Tinh nang chinh

- Search phim theo title, actor, director, genre, keyword, nam phat hanh, rating.
- Rank ket qua search bang relevance score.
- Build graph in-memory tu movie metadata.
- Recommend phim bang shared graph neighbors:
  - same director
  - same actor
  - same genre
  - shared keyword
  - same country/language
- Normalize recommendation score ve thang `0-100`.
- Slider threshold trong recommendation: chi lay phim co score >= threshold.
- Ghi nhan user interactions realtime: search, click, view, favorite, watchlist, rating.
- Runtime recommendation settings: co the doi weight ma khong can restart server.

## Cau truc thu muc

```text
.
├── FE/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── app/
│       │   ├── App.tsx
│       │   └── components/
│       │       ├── AuthPage.tsx
│       │       ├── SearchPage.tsx
│       │       ├── MovieCard.tsx
│       │       ├── MovieModal.tsx
│       │       └── movieData.ts
│       └── styles/
│
├── BE/
│   ├── .env
│   ├── ca.pem
│   ├── final_movie_catalog.csv
│   ├── docs/
│   └── java/
│       ├── README.md
│       └── src/main/java/com/cinegraph/
│           ├── Application.java
│           ├── domain/
│           ├── graph/
│           ├── index/
│           ├── json/
│           ├── repository/
│           ├── server/
│           └── service/
│
└── README.md
```

## Frontend

Frontend nam trong `FE/`, dung Vite + React.

Chay frontend:

```bash
cd FE
pnpm install
pnpm dev
```

Neu khong dung `pnpm`, co the chay:

```bash
cd FE
npm install
npm run dev
```

Mac dinh Vite se hien URL dang:

```text
http://localhost:5173
```

Luu y: frontend hien tai dang dung local mock data trong:

```text
FE/src/app/components/movieData.ts
```

Backend Java API da co san, nhung frontend chua duoc wire hoan toan sang API backend.

## Backend Java

Backend nam trong:

```text
BE/java
```

Backend duoc viet bang Java thuan JDK, khong can Maven/Gradle. Muc tieu la de phan DSA nhin ro trong code.

Compile:

```bash
javac -d BE/java/out $(find BE/java/src/main/java -name '*.java')
```

Run:

```bash
java -cp BE/java/out com.cinegraph.Application
```

Sau khi start thanh cong:

```text
http://localhost:8080/api/health
```

Neu can doi port:

```bash
PORT=9090 java -cp BE/java/out com.cinegraph.Application
```

Neu can chi ro data file:

```bash
MOVIE_DATA_PATH=BE/final_movie_catalog.jsonl java -cp BE/java/out com.cinegraph.Application
```

Luu y: backend Java hien tai doc JSONL qua `JsonlMovieRepository`. Neu chi co CSV, can convert CSV sang JSONL hoac them repository doc CSV.

## Database

Thong tin ket noi DB nam trong:

```text
BE/.env
```

Khong commit `.env` len Git.

Bang raw movie chinh:

```text
movies
```

Metadata da duoc chia sang cac bang normalized:

```text
genres
actors
directors
keywords
countries
languages
production_companies
```

Relationship tables:

```text
movie_genres
movie_actors
movie_directors
movie_keywords
movie_countries
movie_languages
movie_production_companies
```

Interaction tables:

```text
search_logs
click_logs
movie_view_logs
user_movie_interactions
movie_interaction_stats
```

DB chi luu data va relationship facts. Algorithm layer build graph/index trong memory khi backend start.

## Data Structures / Algorithms

Project dang dung:

- `HashMap` cho movie lookup, title index, inverted index, adjacency list.
- `Trie` cho title prefix search.
- `Inverted Index` cho token search theo title/actor/director/genre/keyword.
- `Graph` bang adjacency list.
- BFS/shared-neighbor traversal cho recommendation.
- `Set` de tranh duplicate candidates.
- `PriorityQueue` de lay top K recommendation.
- Weighted scoring va min-max normalization.

Vi du adjacency list:

```text
movie:inception -> director:christopher-nolan
movie:inception -> actor:leonardo-dicaprio
movie:inception -> genre:sci-fi

actor:leonardo-dicaprio -> movie:inception
actor:leonardo-dicaprio -> movie:titanic
```

## Weight nam o dau?

Search field weights:

```text
BE/java/src/main/java/com/cinegraph/index/IndexedField.java
```

Vi du:

```text
DIRECTOR = 50
ACTOR = 40
GENRE = 30
KEYWORD = 25
```

Graph relationship weights:

```text
BE/java/src/main/java/com/cinegraph/graph/RelationshipType.java
```

Vi du:

```text
DIRECTOR = 5
ACTOR = 4
GENRE = 3
KEYWORD = 2
```

Runtime recommendation weights:

```text
BE/java/src/main/java/com/cinegraph/service/RuntimeRecommendationSettings.java
```

Final score:

```text
final_score =
  graph_weight * graph_similarity_score
  + interaction_weight * interaction_score
  + quality_weight * quality_bonus
```

Default:

```text
graph_weight = 0.60
interaction_weight = 0.30
quality_weight = 0.10
```

## API nhanh

Health:

```bash
curl http://localhost:8080/api/health
```

Search:

```bash
curl "http://localhost:8080/api/search?q=nolan%20sci-fi&limit=5"
```

Movie detail:

```bash
curl "http://localhost:8080/api/movies/{movie_id}"
```

Recommendations:

```bash
curl "http://localhost:8080/api/recommendations?seed=red%20rain&threshold=70&limit=5"
```

Recommendations theo user:

```bash
curl "http://localhost:8080/api/recommendations?seed=red%20rain&threshold=70&limit=5&user_id=demo-user"
```

Log favorite:

```bash
curl -X POST http://localhost:8080/api/interactions/favorite \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "demo-user",
    "movie_id": "curated:underground-tunnel-the-sun-in-the-darkness:5d1c6db77c"
  }'
```

Log rating:

```bash
curl -X POST http://localhost:8080/api/interactions/rating \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "demo-user",
    "movie_id": "movie:inception:5b189f219a",
    "rating": 9
  }'
```

Read runtime settings:

```bash
curl http://localhost:8080/api/recommendation-settings
```

Update runtime settings:

```bash
curl -X POST http://localhost:8080/api/recommendation-settings \
  -H 'Content-Type: application/json' \
  -d '{
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
  }'
```

## Search flow

```text
query
  -> normalize
  -> exact title lookup
  -> trie prefix search
  -> inverted index lookup
  -> score by matched field
  -> apply filters
  -> sort/top K
```

Example:

```text
Query: Leonardo DiCaprio thriller

Actor match: +40
Genre match: +30
Rating/popularity bonus
```

## Recommendation flow

```text
seed movie
  -> get metadata neighbors
  -> visit movies connected to those metadata nodes
  -> remove seed movie
  -> score by shared relationships
  -> add user interaction score
  -> add quality bonus
  -> normalize 0-100
  -> apply threshold
  -> top K
```

Example:

```text
Red Rain
  -> War / Drama / History
  -> Vietnamese cinema
  -> Vietnam
  -> related war/history Vietnamese films
```

## Complexity

Search with inverted index:

```text
O(T + P + C log K)
```

Trong do:

```text
T = so token trong query
P = tong posting lists lay tu inverted index
C = so candidate movies
K = so ket qua can tra ve
```

Recommendation:

```text
O(local_edges + C log K)
```

Voi dataset 10,000 movies, expectation:

```text
startup build index/graph: ~1-5s
normal search: ~1-10ms
common query search: ~5-30ms
normal recommendation: ~5-50ms
heavy recommendation: ~50-150ms
```

## Luu y hien trang

- FE dang la demo UI local data.
- Java backend API da implement core search/recommendation.
- Interaction realtime hien dang luu in-memory, nen restart server se mat runtime user stats/settings.
- Neu muon production hon, buoc tiep theo la persist interaction/settings vao PostgreSQL va wire FE sang backend API.
