# CineGraph

CineGraph is a graph-based movie search and recommendation system built to highlight data structures and algorithms instead of CRUD.

## Highlights

- Search by title, actor, director, genre, keyword, country, year, rating.
- Relevance ranking with quality tie breakers.
- In-memory inverted index, trie, and graph adjacency list.
- Recommendations from shared metadata connections.
- Taste profile with per-field weights.
- Runtime recommendation settings without server restart.
- Search latency shown in UI next to result count.
- UI includes sidebar, profile, theme switch, and VI/EN language.

## Architecture

```
Frontend (Vite + React)
  -> calls API
Backend (Java)
  -> in-memory store
  -> inverted index + trie
  -> graph adjacency list
Data source (JSONL or PostgreSQL via psql)
```

## Project structure

```
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
│       └── styles/
│
├── BE/
│   ├── config.properties
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

## Quick start

### 1) Backend (Java)

```bash
BE/run.sh
```

The script kills old FE/BE processes on known ports, cleans output, compiles Java sources, and starts the API server.

Health check:

```
http://localhost:8080/api/health
```

Change port:

```properties
server.port=9090
```

Use a specific config file:

```bash
BE/run.sh --config BE/config.properties
```

Use JSONL instead of DB:

```properties
movie.source=jsonl
movie.data.path=final_movie_catalog.jsonl
```

Or:

```bash
BE/run.sh --jsonl BE/final_movie_catalog.jsonl
```

Use PostgreSQL via psql CLI:

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

### 2) Frontend (Vite + React)

```bash
cd FE
pnpm install
pnpm dev
```

If you do not use pnpm:

```bash
cd FE
npm install
npm run dev
```

Default Vite URL:

```
http://localhost:5173
```

Frontend uses backend APIs first and falls back to local seed data when the API is not available.

## Configuration and security

- Backend config is loaded from `BE/config.properties` (ignored by git).
- Do not commit secrets.
- Frontend API base URL can be set with `VITE_API_BASE_URL`.
- Backend config file can be overridden with `CONFIG_PATH` or `--config`.

## API quick reference

Health:

```bash
curl http://localhost:8080/api/health
```

Search:

```bash
curl "http://localhost:8080/api/search?q=nolan%20sci-fi&limit=5"
```

Search response includes `search_time_ms` for server-side timing.

Movie detail:

```bash
curl "http://localhost:8080/api/movies/{movie_id}"
```

Recommendations:

```bash
curl "http://localhost:8080/api/recommendations?seed=red%20rain&threshold=70&limit=5"
```

Runtime settings:

```bash
curl http://localhost:8080/api/recommendation-settings
```

## Search flow (summary)

```
query
  -> normalize
  -> exact title lookup
  -> trie prefix search
  -> inverted index lookup
  -> score by matched field
  -> apply filters
  -> sort/top K
```

## Recommendation flow (summary)

```
seed movie
  -> metadata neighbors
  -> candidate movies
  -> score by shared relationships
  -> add interaction + quality + taste
  -> normalize 0-100
  -> apply threshold
  -> top K
```

## Weights and scoring

- Search field weights: `BE/src/index/IndexedField.java`
- Graph relationship weights: `BE/src/graph/RelationshipType.java`
- Runtime recommendation weights: `BE/src/service/RuntimeRecommendationSettings.java`
- Defaults live in `BE/config.properties`

## Benchmark notes

- UI shows: `result count | X ms` for search.
- API returns `search_time_ms` for server-side processing time (network not included).

## Troubleshooting

- Address already in use: re-run `BE/run.sh` or change `server.port`.
- DB not loading: ensure `psql` is in PATH and DB config is correct.
- FE fallback banner: backend API is not running or not reachable.

## Current limitations

- Interaction stats and runtime settings are in memory; they reset on restart.
- For production, persist interactions and settings in PostgreSQL.
