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

- Search phim theo title, actor, director, genre, keyword, quoc gia, nam phat hanh, rating.
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
- User taste profile: the loai, quoc gia, dien vien, dao dien, keyword va weight rieng duoc dua vao search/recommendation.
- UI co sidebar tab doc ben trai, profile settings, light/dark theme, VI/EN language, va search results duoc gom theo khu vuc phim.

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
│   ├── config.properties
│   ├── ca.pem
│   ├── final_movie_catalog.csv
│   ├── run.sh
│   ├── docs/
│   └── src/
│       ├── Application.java
│       ├── domain/
│       ├── graph/
│       ├── index/
│       ├── json/
│       ├── repository/
│       ├── server/
│       └── service/
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

Frontend uu tien backend API (`/api/movies`, `/api/search`, `/api/recommendations`) va chi fallback ve local seed data khi API chua chay.

## Backend Java

Backend nam trong:

```text
BE/src
```

Backend duoc viet bang Java thuan JDK, khong can Maven/Gradle. Muc tieu la de phan DSA nhin ro trong code. Backend mac dinh doc config tu `BE/config.properties` thay cho `.env`.

Chay nhanh:

```bash
BE/run.sh
```

Lenh tren se clean `BE/out`, compile lai Java source trong `BE/src`, sau do start API server.

Compile thu cong:

```bash
javac -d BE/out $(find BE/src -name '*.java')
```

Run thu cong:

```bash
java -cp BE/out Application
```

Sau khi start thanh cong:

```text
http://localhost:8080/api/health
```

Neu can doi port:

```properties
server.port=9090
```

Neu can chi ro file config khac:

```bash
BE/run.sh --config BE/config.properties
```

Neu muon debug bang JSONL thay DB:

```properties
movie.source=jsonl
movie.data.path=final_movie_catalog.jsonl
```

Hoac:

```bash
BE/run.sh --jsonl BE/final_movie_catalog.jsonl
```

Neu dung PostgreSQL, set trong `BE/config.properties`:

```properties
movie.source=postgres
db.psql.bin=psql
db.host=your-host
db.port=5432
db.name=your-db
db.user=your-user
db.password=your-password
db.sslmode=require
db.schema=public
db.table=movies
```

Luu y: Java goi `psql` CLI de doc DB theo `BE/config.properties`. Cach nay giu project Java thuan, khong can JDBC jar/Maven.

## Database

Thong tin ket noi DB va config backend nam trong:

```text
BE/config.properties
```

Khong commit `BE/config.properties` len Git neu co secrets.

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
BE/src/index/IndexedField.java
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
BE/src/graph/RelationshipType.java
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
BE/src/service/RuntimeRecommendationSettings.java
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
  -> add taste weight score
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
  -> add taste preference bonus
  -> normalize 0-100
  -> apply threshold
  -> top K
```

Taste params tu frontend/API:

```text
preferred_genres, preferred_countries, preferred_actors, preferred_directors, preferred_keywords
genre_weight, country_weight, actor_weight, director_weight, keyword_weight
```

Backend score weights tu `BE/config.properties`:

```properties
recommendation.graph_weight=0.60
recommendation.interaction_weight=0.30
recommendation.quality_weight=0.10
recommendation.user_interaction_blend=0.70
recommendation.relationship.director=5.0
recommendation.relationship.actor=4.0
recommendation.relationship.genre=3.0
recommendation.relationship.keyword=2.0
recommendation.relationship.country=1.0
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

- FE da wire sang Java backend API va fallback ve local seed data neu API chua chay.
- Java backend API da implement core search/recommendation voi taste weights.
- Interaction realtime hien dang luu in-memory, nen restart server se mat runtime user stats/settings.
- Neu muon production hon, buoc tiep theo la persist interaction/settings vao PostgreSQL.
