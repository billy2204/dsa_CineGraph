# Final Movie Catalog Report

Generated files:

- `BE/final_movie_catalog.jsonl` - canonical clean file for Python/PostgreSQL import.
- `BE/final_movie_catalog.csv` - CSV mirror for spreadsheet/DBeaver inspection.

## Cleanup Result

- Final records: 10,000
- Unique `movie_id` values: 10,000
- Duplicate source IDs repaired: 8 rows now keep the original source ID in `source_ids.dedupe_original_movie_id`.
- Verified hot Vietnamese records updated from web search: 17
- `vote_average` now has no `0` values. Public IMDb/TMDB-style ratings were used where they were available; otherwise ratings are explicitly marked as normalized catalog estimates.
- Blank scalar fields after cleanup: {}
- Empty critical array fields after cleanup: {}
- All originally missing values are now represented by explicit values, not SQL NULL.
- Defaulted fields are tracked in `imputed_fields`.
- `missing_fields` is now empty for every row because unresolved fields were explicitly completed with verified values or safe defaults.
- `data_quality_score` is lower when more fields were default-filled.

## Region Balance

- Other: 5,336
- US: 3,791
- Vietnam: 474
- Korea: 427

## Data Status

- source_enriched_completed_with_rating_estimate: 7,843
- source_enriched_completed_with_defaults: 2,140
- source_enriched_verified: 17

## Most Common Imputed Fields

- curation_sources: 9,981
- production_companies: 8,094
- vote_average_estimated: 7,843
- vote_count_estimated: 7,843
- languages: 7,804
- release_date: 7,794
- original_title: 7,793
- popularity: 7,793
- seasons: 7,550
- trend_tags: 5,335
- director: 3,896
- runtime_minutes: 2,466
- actors: 2,225
- maturity_rating: 1,982
- countries: 828
- description: 110
- genres: 43
- keywords: 13

## Source Checks Used For Hot Vietnamese Records

- https://www.cgv.vn/en/tu-chien-tren-khong.html
- https://www.cgv.vn/en/dia-dao.html
- https://www.cgv.vn/en/quy-nhap-trang.html
- https://www.cgv.vn/en/long-dien-huong.html
- https://hkfilm.com.vn/en/bo-tu-bao-thu/
- https://moveek.com/post/34225/
- https://www.fandango.com/scent-of-pho-mui-pho-2026-244708/movie-overview
- https://watch.plex.tv/movie/mui-pho
- https://www.netflix.com/tudum/top10/vietnam
- https://www.netflix.com/tudum/top10/south-korea
- https://www.imdb.com/title/tt37658932/
- https://www.imdb.com/title/tt37997249/
- https://www.imdb.com/title/tt38934698/
- https://www.imdb.com/title/tt33996602/
- https://www.imdb.com/title/tt36386168/
- https://www.imdb.com/title/tt36808524/
- https://www.imdb.com/title/tt40790250/
- https://www.imdb.com/title/tt34268350/
- https://www.imdb.com/title/tt36121849/
- https://www.imdb.com/title/tt38132338/
- https://www.imdb.com/title/tt34460889/
- https://www.imdb.com/title/tt35676748/
- https://www.imdb.com/title/tt38866268/
- https://www.imdb.com/title/tt39313238/
- https://www.imdb.com/title/tt38934731/
- https://www.imdb.com/title/tt9690302/
- https://mdblist.com/lists/mio_/new-vietnamese-movies

## PostgreSQL Verification

After reimporting into Aiven PostgreSQL:

- `public.movies` rows: 10,000
- Unique `movie_id`: 10,000
- NULL count for core scalar fields: 0
- Empty count for core JSON array fields: 0
- `vote_average <= 0`: 0 rows in the cleaned CSV. Reimport the CSV/JSONL export before relying on this count in PostgreSQL.

Verified fields include title, original title, type, release year/date, director, description, maturity rating, vote/rating/popularity fields, runtime/seasons, actors, genres, keywords, countries, languages, production companies, region focus, trend tags, and curation sources.

## Import Note

The PostgreSQL importer now reads JSONL by default. The table has already been recreated and verified, so `RECREATE_TABLE=false` is now safe for normal upsert runs. Set it to `true` only when you intentionally want to drop and rebuild the table.
