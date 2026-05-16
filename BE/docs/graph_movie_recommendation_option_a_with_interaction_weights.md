# Graph-Based Movie Search Engine

## Report: Retrieval and Recommendation Design Using In-Memory Graph Construction

## 1. Project Overview

This project is a simple movie search engine for a Data Structures and Algorithms course. The main feature is not only searching, filtering, and retrieving movies, but also recommending related movies by using graph-based relationships between movie metadata.

The system allows users to search for movies by title, genre, actor, director, keyword, release year, rating, and other metadata. After retrieving search results, the system recommends related movies based on shared graph connections such as same director, same actors, same genres, and similar keywords.

The selected design is:

> Option A: Do not store the graph permanently in the database. Instead, retrieve normalized data from the database and build the graph in memory when the server starts.

This design is suitable for a DSA project because it clearly demonstrates the use of graph, adjacency list, hash map, set, BFS, weighted scoring, inverted index, and priority queue.

---

## 2. Why the Current Table Should Be Improved

The current movie table contains fields such as:

```text
movie_id
actors jsonb
catalog_rank
countries jsonb
created_at
curation_sources jsonb
data_quality_score
data_status
description
director
genres jsonb
imputed_fields jsonb
keywords jsonb
languages jsonb
maturity_rating
missing_fields jsonb
original_title
popularity
production_companies jsonb
region_focus jsonb
release_date
release_year
runtime_minutes
seasons
source_ids jsonb
title
trend_score
trend_tags jsonb
type
updated_at
vote_average
vote_count
```

This structure is convenient for storing raw or semi-structured movie data. However, it is not ideal for implementing a graph-based recommendation system because many important relationships are stored inside `jsonb` fields.

For example, the following fields represent relationships:

```text
genres jsonb
actors jsonb
keywords jsonb
countries jsonb
languages jsonb
production_companies jsonb
```

If these values stay inside JSON fields, it becomes harder to:

- Query shared relationships efficiently.
- Represent metadata as graph nodes.
- Build clear movie-to-metadata edges.
- Explain recommendations.
- Demonstrate DSA concepts clearly.

Therefore, the data should be normalized into separate tables.

---

## 3. Recommended Database Design

The database should still keep a main `movies` table, but repeated metadata such as genres, actors, directors, and keywords should be separated into their own tables.

### 3.1 Main Movie Table

```text
movies
- movie_id
- title
- original_title
- description
- release_date
- release_year
- vote_average
- vote_count
- popularity
- trend_score
- maturity_rating
- runtime_minutes
- type
- data_status
- data_quality_score
- created_at
- updated_at
```

This table stores the core movie information.

---

### 3.2 Metadata Tables

```text
genres
- genre_id
- name
```

```text
actors
- actor_id
- name
```

```text
directors
- director_id
- name
```

```text
keywords
- keyword_id
- name
```

```text
countries
- country_id
- name
```

```text
languages
- language_id
- name
```

```text
production_companies
- company_id
- name
```

The most important metadata tables for recommendation are:

```text
genres
actors
directors
keywords
```

Countries, languages, and production companies can be added later as weaker recommendation signals.

---

### 3.3 Relationship Tables

Because one movie can have many genres, actors, keywords, countries, and languages, many-to-many relationship tables are needed.

```text
movie_genres
- movie_id
- genre_id
```

```text
movie_actors
- movie_id
- actor_id
- actor_order
```

```text
movie_directors
- movie_id
- director_id
```

```text
movie_keywords
- movie_id
- keyword_id
```

```text
movie_countries
- movie_id
- country_id
```

```text
movie_languages
- movie_id
- language_id
```

```text
movie_production_companies
- movie_id
- company_id
```

These relationship tables act as graph edges in the system.

---

## 4. Graph Representation

The recommendation system can represent the movie data as a heterogeneous graph.

### 4.1 Node Types

```text
Movie
Genre
Actor
Director
Keyword
Country
Language
ProductionCompany
```

For the main recommendation feature, the most important node types are:

```text
Movie
Genre
Actor
Director
Keyword
```

---

### 4.2 Edge Types

```text
Movie -- Genre
Movie -- Actor
Movie -- Director
Movie -- Keyword
Movie -- Country
Movie -- Language
Movie -- ProductionCompany
```

Example:

```text
Inception -- Sci-Fi
Inception -- Thriller
Inception -- Christopher Nolan
Inception -- Leonardo DiCaprio
Inception -- dream
```

In the relational database, these graph edges are stored as relationship tables:

```text
movie_genres       = Movie -- Genre
movie_actors       = Movie -- Actor
movie_directors    = Movie -- Director
movie_keywords     = Movie -- Keyword
```

---

## 5. Selected Architecture: Option A

The selected approach is:

> The database stores normalized movie data, but the backend builds the graph in memory when the server starts.

### 5.1 How It Works

When the backend server starts:

1. Retrieve movie records from the `movies` table.
2. Retrieve metadata records from `genres`, `actors`, `directors`, and `keywords`.
3. Retrieve relationship records from `movie_genres`, `movie_actors`, `movie_directors`, and `movie_keywords`.
4. Build an in-memory adjacency list.
5. Build search indexes such as hash maps, trie, and inverted indexes.
6. Use the graph and indexes to process search and recommendation requests.

---

### 5.2 Why Option A Is Suitable for DSA

Option A is suitable for a DSA project because it clearly shows the algorithmic process.

It demonstrates:

- Graph construction.
- Adjacency list representation.
- BFS traversal.
- Shared-neighbor similarity.
- Weighted graph scoring.
- Hash map lookup.
- Set-based duplicate removal.
- Priority queue for top-K recommendations.
- Inverted index for text search.

This approach is better for academic demonstration than simply storing precomputed recommendations in a database.

---

## 6. In-Memory Graph Structure

The backend can build the graph as an adjacency list.

Example structure:

```text
graph = {
  "movie:inception": [
    "genre:sci-fi",
    "genre:thriller",
    "director:christopher_nolan",
    "actor:leonardo_dicaprio",
    "keyword:dream"
  ],

  "genre:sci-fi": [
    "movie:inception",
    "movie:interstellar",
    "movie:the_matrix",
    "movie:arrival"
  ],

  "director:christopher_nolan": [
    "movie:inception",
    "movie:interstellar",
    "movie:tenet",
    "movie:the_prestige"
  ]
}
```

This structure allows the system to move from a movie node to metadata nodes, and then from metadata nodes to other related movie nodes.

---

## 7. Search Data Structures

Search and recommendation should be separated.

Search answers:

> Which movies best match the user's query?

Recommendation answers:

> Which movies are most related to the selected movie or search result?

---

### 7.1 Hash Map for Exact Lookup

A hash map can be used for exact title lookup.

```text
title_index:
"inception" -> movie_id_1
"interstellar" -> movie_id_2
"the matrix" -> movie_id_3
```

This provides fast retrieval when the user enters an exact movie title.

---

### 7.2 Trie for Prefix Search and Autocomplete

A trie can be used to support prefix-based search.

Example:

```text
Input: "inc"
Output: "Inception"
```

```text
Input: "inter"
Output: "Interstellar"
```

This is useful for autocomplete and partial title search.

---

### 7.3 Inverted Index for Metadata Search

An inverted index maps a word or metadata value to a list of movies.

Example:

```text
"nolan" -> [Inception, Interstellar, Tenet, The Prestige]
"sci-fi" -> [Inception, Interstellar, The Matrix, Arrival]
"leonardo dicaprio" -> [Inception, Titanic, Shutter Island]
"dream" -> [Inception, Paprika]
```

For a query such as:

```text
nolan sci-fi
```

The system retrieves:

```text
nolan  -> [Inception, Interstellar, Tenet]
sci-fi -> [Inception, Interstellar, The Matrix]
```

Movies appearing in multiple lists receive a higher search relevance score.

---

## 8. Search Retrieval Flow

When a user enters a query, the system follows this flow:

```text
User enters query
        |
        v
Normalize query
        |
        v
Search title hash map, trie, and inverted index
        |
        v
Calculate search relevance score
        |
        v
Sort search results
        |
        v
Return top search results
```

---

## 9. Search Ranking Rules

Search results should be ranked by relevance.

Example search scoring:

```text
Exact title match       +100
Partial title match     +70
Director match          +50
Actor match             +40
Genre match             +30
Keyword match           +25
High rating bonus       +10
High popularity bonus   +10
```

A possible formula:

```text
search_score = title_score + metadata_score + rating_bonus + popularity_bonus
```

Search ranking and recommendation ranking should remain separate because they solve different problems.

---

## 10. Recommendation Retrieval Flow

Assume the user searches for:

```text
Inception
```

### Step 1: Find the Target Movie

The system first retrieves the best matching movie using the search index.

```text
target_movie = Inception
```

---

### Step 2: Retrieve Neighbor Nodes

From the graph, retrieve all metadata nodes connected to the target movie.

Example:

```text
Inception -> Sci-Fi
Inception -> Thriller
Inception -> Christopher Nolan
Inception -> Leonardo DiCaprio
Inception -> dream
Inception -> mind-bending
```

These nodes are the direct neighbors of the target movie.

---

### Step 3: Find Candidate Movies

For each metadata node, find other movies connected to that same node.

Example:

```text
Sci-Fi -> Interstellar, The Matrix, Arrival
Thriller -> Shutter Island, Se7en, Memento
Christopher Nolan -> Interstellar, Tenet, The Prestige
Leonardo DiCaprio -> Shutter Island, Titanic, The Revenant
dream -> Paprika, The Matrix
```

Then merge all movies into a candidate set:

```text
candidate_movies = {
  Interstellar,
  The Matrix,
  Arrival,
  Shutter Island,
  Memento,
  Tenet,
  The Prestige,
  Titanic,
  Paprika
}
```

The system must remove the target movie itself:

```text
candidate_movies.remove(Inception)
```

---

### Step 4: Score Each Candidate Movie

Each candidate receives a recommendation score based on shared graph relationships.

Example weights:

```text
Same director       weight = 5
Same actor          weight = 4
Same genre          weight = 3
Same keyword        weight = 2
Same country        weight = 1
Same language       weight = 1
Similar year        weight = 1
Rating bonus        small bonus
Popularity bonus    small bonus
```

A possible graph-only formula:

```text
graph_similarity_score =
  5 * shared_director_count
+ 4 * shared_actor_count
+ 3 * shared_genre_count
+ 2 * shared_keyword_count
+ rating_bonus
+ popularity_bonus
```

In the updated design, this score is later combined with normalized user interaction signals such as search frequency, click count, view count, favorites, and watchlist actions.

---

### Step 5: Select Top-K Recommendations

Use a priority queue or heap to select the top K movies with the highest recommendation score.

Example:

```text
Top 5 recommendations for Inception:
1. Interstellar
2. Tenet
3. The Prestige
4. Shutter Island
5. The Matrix
```

---

## 11. Graph Algorithm: BFS-Based Candidate Discovery

The recommendation process can be explained as a BFS traversal.

```text
Level 0: Target movie
Level 1: Metadata nodes connected to the target movie
Level 2: Other movies connected to those metadata nodes
```

Example:

```text
Inception
 -> Christopher Nolan
   -> Interstellar
   -> Tenet
   -> The Prestige

Inception
 -> Sci-Fi
   -> The Matrix
   -> Arrival
   -> Avatar
```

Only movies found at level 2 are used as recommendation candidates.

This keeps recommendations closely related to the target movie.

---

## 12. Shared-Neighbor Similarity

The system can also explain recommendation using shared-neighbor similarity.

Two movies are considered similar if they share many metadata nodes.

Example:

```text
Inception -> Sci-Fi -> Interstellar
Inception -> Christopher Nolan -> Interstellar
Inception -> mind-bending -> Interstellar
```

Because Inception and Interstellar share multiple neighbors, Interstellar receives a high recommendation score.

---

## 13. User Interaction Signals as Additional Weights

In addition to graph relationships such as shared director, actor, genre, and keyword, the system should also use user interaction data as extra weights in the recommendation score. These signals help the recommendation system reflect real user behavior instead of relying only on static movie metadata.

The important interaction signals are:

```text
search_frequency
click_count
view_count
favorite_count
watchlist_count
rating_count
recent_interaction_score
```

These signals can be collected whenever users search, click, open, save, or interact with a movie.

---

### 13.1 Additional Tables for User Interaction Data

The graph itself is still not stored permanently. However, user interaction data should be stored in normal database tables because it changes over time.

```text
search_logs
- search_id
- user_id
- query_text
- searched_at
```

```text
movie_click_logs
- click_id
- user_id
- movie_id
- clicked_at
```

```text
movie_interactions
- interaction_id
- user_id
- movie_id
- interaction_type
- created_at
```

The `interaction_type` field can contain values such as:

```text
view
click
favorite
watchlist
like
rating
```

For faster recommendation, the system can also maintain an aggregated table:

```text
movie_interaction_stats
- movie_id
- search_count
- click_count
- view_count
- favorite_count
- watchlist_count
- average_user_rating
- recent_interaction_score
- updated_at
```

This table does not store the graph. It only stores aggregated behavior statistics that can be used as dynamic weights.

---

### 13.2 Why Interaction Weights Are Needed

Static graph relationships answer:

> Which movies are structurally similar?

User interaction signals answer:

> Which movies are users actually interested in?

For example, two movies may have the same graph similarity score, but the movie with more clicks, searches, and watchlist actions should be ranked higher because it shows stronger user interest.

---

### 13.3 Updated Recommendation Score

The recommendation score should combine two groups of features:

1. Graph-based similarity score.
2. User interaction score.

A possible formula is:

```text
final_recommendation_score =
  graph_similarity_score
+ interaction_score
+ quality_bonus
```

Where:

```text
graph_similarity_score =
  5 * shared_director_count
+ 4 * shared_actor_count
+ 3 * shared_genre_count
+ 2 * shared_keyword_count
+ 1 * shared_country_count
+ 1 * shared_language_count
```

```text
interaction_score =
  0.30 * normalized_search_count
+ 0.35 * normalized_click_count
+ 0.20 * normalized_view_count
+ 0.10 * normalized_watchlist_count
+ 0.05 * normalized_favorite_count
```

```text
quality_bonus =
  0.60 * normalized_vote_average
+ 0.40 * normalized_popularity
```

The exact weight values can be adjusted during testing. For a DSA project, the important point is that the system combines graph similarity with behavior-based ranking.

---

### 13.4 Normalization Rule

Raw interaction values should not be added directly because large numbers can dominate the score. For example, `click_count = 50000` would overpower graph similarity.

Therefore, interaction values should be normalized before scoring.

A simple normalization method is:

```text
normalized_value = value / max_value
```

Example:

```text
movie_click_count = 500
max_click_count = 1000
normalized_click_count = 500 / 1000 = 0.5
```

Another suitable method is log normalization:

```text
normalized_value = log(1 + value) / log(1 + max_value)
```

Log normalization is useful when some movies are much more popular than others.

---

### 13.5 Updated Recommendation Flow

The recommendation process should be updated as follows:

```text
User enters query
        |
        v
Search movies using title index, trie, and inverted index
        |
        v
Select target movie or top N search results
        |
        v
Retrieve graph neighbors from in-memory adjacency list
        |
        v
Find candidate movies through shared metadata nodes
        |
        v
Retrieve aggregated user interaction statistics
        |
        v
Normalize search, click, view, and interaction counts
        |
        v
Calculate graph similarity score
        |
        v
Calculate interaction score
        |
        v
Calculate final recommendation score
        |
        v
Use priority queue to return top K movies
```

This means the system first uses the graph to find relevant candidate movies, then uses user behavior data to improve the ranking.

---

### 13.6 Example

Assume two candidate movies are related to `Inception`:

```text
Candidate A: Interstellar
Graph similarity score = 10
Interaction score = 2.5
Quality bonus = 1.0
Final score = 13.5
```

```text
Candidate B: The Matrix
Graph similarity score = 8
Interaction score = 4.0
Quality bonus = 1.2
Final score = 13.2
```

Although `The Matrix` has stronger interaction signals, `Interstellar` still ranks slightly higher because it has a stronger graph relationship with `Inception`.

This creates a balanced recommendation system that considers both metadata similarity and user behavior.

---

### 13.7 Business Rules for Interaction Weights

1. The system shall record user search frequency.
2. The system shall record movie click counts.
3. The system shall record user interactions such as views, favorites, watchlist actions, and ratings.
4. The system shall aggregate raw interaction logs into movie-level statistics.
5. The system shall normalize interaction values before using them in recommendation scoring.
6. The system shall combine graph similarity score and interaction score to calculate the final recommendation score.
7. The system shall not use interaction data to replace graph similarity; interaction data shall only adjust the ranking of graph-based candidates.
8. The system shall update interaction statistics periodically or whenever new user actions are recorded.
9. The system shall use priority queue or heap to select the top K movies after calculating the final score.
10. The system shall explain recommendations using both graph reasons and interaction reasons when possible.

Example explanation:

```text
Recommended: Interstellar
Reason:
- Same director: Christopher Nolan
- Same genre: Sci-Fi
- High click and search frequency among users
```

---

## 14. Recommendation Explanation

Each recommendation should include a short reason.

Example:

```text
Recommended: Interstellar
Reason:
- Same director: Christopher Nolan
- Same genre: Sci-Fi
- Similar keyword: mind-bending
```

```text
Recommended: Shutter Island
Reason:
- Same actor: Leonardo DiCaprio
- Same genre: Thriller
- Similar psychological theme
```

This is important because it proves that the recommendation comes from graph relationships, not only from text matching.

---

## 15. Full System Flow

```text
User enters query
        |
        v
Normalize query
        |
        v
Search using hash map, trie, and inverted index
        |
        v
Rank search results
        |
        v
Select top result or top N results
        |
        v
Retrieve graph neighbors
        |
        v
Find candidate movies through shared metadata nodes
        |
        v
Calculate graph similarity score
        |
        v
Retrieve and normalize user interaction statistics
        |
        v
Calculate final recommendation score
        |
        v
Use priority queue to get top K movies
        |
        v
Return search results + recommendations + reasons
```

---

## 16. Data Structures Used

| Feature | Data Structure |
|---|---|
| Store movie relationships | Graph |
| Graph representation | Adjacency list |
| Exact title lookup | Hash map |
| Prefix title search | Trie |
| Keyword, actor, genre search | Inverted index |
| Candidate discovery | BFS |
| Avoid duplicate recommendations | Set |
| Recommendation score storage | Hash map |
| Get top K recommendations | Priority queue / heap |
| Filtering results | Array/List with conditions |

---

## 17. Business Rules

1. The system shall allow users to search movies by title, genre, actor, director, release year, rating, and keywords.
2. The system shall rank search results based on relevance.
3. Exact title matches shall have the highest priority.
4. Partial title matches shall still return relevant movies.
5. Search shall support multiple fields, including title, genre, actor, director, keyword, and description.
6. Filters shall reduce the search result set without changing the meaning of the original query.
7. The system shall represent movies and metadata as graph nodes.
8. The system shall create graph edges between movies and their metadata.
9. The system shall build the graph in memory when the backend server starts.
10. The system shall not permanently store the graph as a separate database object.
11. The system shall recommend movies based on shared graph relationships.
12. Different relationship types shall have different weights.
13. Shared director and shared actor shall have higher weights than shared keyword.
14. The searched movie itself shall not appear in its own recommendation list.
15. Duplicate recommendations shall be removed.
16. Recommendations shall be sorted by recommendation score.
17. Each recommendation should include a reason.
18. The system shall limit the number of search results and recommendations shown to the user.
19. Search ranking and recommendation ranking shall be calculated separately.
20. The system shall collect user behavior signals such as search frequency, click count, view count, favorites, and watchlist actions.
21. The system shall aggregate raw user behavior logs into movie-level interaction statistics before running the recommendation function.
22. The system shall normalize user interaction values before adding them to the final recommendation score.
23. The system shall use DSA concepts such as graph, BFS, hash map, trie, inverted index, set, and priority queue.

---

## 18. Example Case

### User Query

```text
Inception
```

### Search Result

```text
1. Inception
```

### Graph Neighbors of Inception

```text
Sci-Fi
Thriller
Christopher Nolan
Leonardo DiCaprio
dream
mind-bending
```

### Candidate Movies

```text
Interstellar
Tenet
The Prestige
Shutter Island
The Matrix
Paprika
Arrival
```

### Recommendation Ranking

```text
1. Interstellar
   Reason: same director, same genre, similar keyword

2. Tenet
   Reason: same director, similar mind-bending concept

3. The Prestige
   Reason: same director, mystery/thriller relationship

4. Shutter Island
   Reason: same actor and thriller genre

5. The Matrix
   Reason: same genre and similar keyword
```

---

## 19. Complexity Discussion

Let:

```text
V = number of graph nodes
E = number of graph edges
N = number of movies
K = number of recommendations needed
```

### Graph Construction

Building the adjacency list requires reading all movie-metadata relationships.

```text
Time complexity: O(V + E)
Space complexity: O(V + E)
```

### Search with Hash Map

Exact lookup:

```text
Average time complexity: O(1)
```

### Trie Prefix Search

If the query length is L:

```text
Time complexity: O(L)
```

### Inverted Index Search

If a query has T tokens and each token maps to a list of movies:

```text
Time complexity: O(total retrieved posting list size)
```

### BFS Candidate Discovery

Because recommendation only goes from movie to metadata nodes and then to related movies, the traversal is shallow.

```text
Time complexity: O(number of visited edges within depth 2)
```

### Top-K Recommendation Selection

Using a priority queue:

```text
Time complexity: O(C log K)
```

Where C is the number of candidate movies.

---

## 20. Final Design Summary

The final design is:

```text
Database:
- Store normalized movie data.
- Keep movies as the main table.
- Separate genres, actors, directors, and keywords into metadata tables.
- Use relationship tables such as movie_genres, movie_actors, movie_directors, and movie_keywords.

Backend:
- Retrieve data from the database when the server starts.
- Build an in-memory graph using adjacency list.
- Build search indexes using hash map, trie, and inverted index.
- Use BFS and shared-neighbor scoring for candidate recommendation.
- Retrieve aggregated user interaction data such as search frequency, click count, view count, favorites, and watchlist actions.
- Combine graph similarity score with normalized interaction score before final ranking.
- Use priority queue to return top K recommendations.

Frontend:
- Display search results.
- Display recommended movies.
- Display explanation for each recommendation.
```

---

## 21. Report Statement

The database stores normalized movie metadata, while the backend transforms this relational data into an in-memory weighted graph. Search is performed using hash maps, tries, and inverted indexes, whereas recommendations are generated through BFS-based graph traversal, weighted shared-neighbor similarity scoring, and normalized user interaction weighting. This design clearly demonstrates the use of core data structures and algorithms in a practical movie search engine system.
