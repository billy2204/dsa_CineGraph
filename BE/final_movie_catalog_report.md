# Final Movie Catalog Report

Generated file: `BE/final_movie_catalog.csv`

## Goal

Build one consolidated movie catalog of about 10,000 records for the graph-based movie search engine. The catalog prioritizes Vietnamese and Korean titles, keeps current Netflix Vietnam/South Korea trend signals, and reduces the number of lower-priority US records.

## Output Summary

- Final records: 10,000
- Source records before balancing: 10,785
- Curated Vietnamese/Korean/trending additions: 16
- Existing records updated with trend/curation tags: 3
- Curated records kept in final file: 17

## Region Balance

| Region marker | Before | After |
|---|---:|---:|
| Vietnam | 493 | 493 |
| Korea | 448 | 448 |
| US | 4,576 | 3,791 |

## Type Counts

- Movie: 7,550
- TV Show: 2,450

## Top Countries In Final File

- United States: 2,905
- India: 1,068
- United States of America: 1,033
- United Kingdom: 912
- Canada: 503
- France: 485
- Vietnam: 475
- Japan: 431
- South Korea: 427
- China: 286
- Spain: 257
- Germany: 246
- Australia: 189
- Hong Kong: 176
- Mexico: 172

## Remaining Missing Fields

- actors: 2,241
- description: 110
- director: 3,904
- genres: 43
- keywords: 13

## Current Netflix Trend Check

Netflix Tudum Top 10 was checked for the week `5/4/26 - 5/10/26`.

Vietnam movie Top 10: Apex, Swapped, My Dearest Assassin, Fish, Fists and Ambergris, Trap, 28 Years Later: The Bone Temple, Despicable Me 4, The 4 Rascals, Mai, Humint.

South Korea movie Top 10: The Beast, Memory, Hitman 2, Apex, Anora, Wish, My Dearest Assassin, Twilight of the Warriors: Walled In, Blind, Humint.

## Vietnamese Popular Film Sources Used

- Vietnam.vn reported the 2025 Vietnamese top-grossing titles, including Red Rain, The 4 Rascals, Hijacked, Detective Kien, Ancestral House, Flip Face 8, Billion-Dollar Kiss, Searching for Long Dien Huong, Underground Tunnel, and Abandoning My Mother.
- VOV reported Red Rain as the standout 2025 title and noted the strong domestic market share for Vietnamese films.
- VnExpress reported Red Rain becoming Vietnam's highest-grossing film ever.
- Bao Phap Luat Vietnam reported the 2026 Tet box-office surge and titles Bunny!!, Nha Ba Toi Mot Phong, Bau Vat Troi Cho, and Mui Pho.

## Source URLs

- https://www.netflix.com/tudum/top10/vietnam
- https://www.netflix.com/tudum/top10/south-korea
- https://www.vietnam.vn/en/dien-anh-viet-2025-thang-nhieu-ma-thua-cung-lam
- https://english.vov.vn/en/culture/vietnam-cinema-sees-boom-year-in-2025-enters-consolidation-phase-post1255193.vov
- https://e.vnexpress.net/news/life/arts/vietnam-war-film-red-rain-becomes-highest-grossing-film-of-all-time-4936554.html
- https://baophapluat.vn/doanh-thu-phim-viet-bung-no-dip-tet-2026.html

## Notes

- The final CSV stores list fields as JSON strings so Java/Python can parse them safely.
- US records were not deleted from the raw sources; only the final selected catalog reduces lower-priority US titles.
- The original raw files `BE/netflix_titles.csv` and `BE/Movies.csv` were kept for rebuild safety.
- Curated records use source-backed popularity/trend signals. Unknown fields are left blank instead of being silently hallucinated.
