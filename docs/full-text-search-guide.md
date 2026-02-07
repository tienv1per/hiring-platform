# Full-Text Search Implementation Guide

## Current Implementation

**Backend Endpoint:** `GET /api/skills?q={searchTerm}`  
**Location:** `backend/user-service/handlers/skills_handler.go` (line 128-161)

**Current Query:**
```sql
SELECT id, name, created_at
FROM skills
WHERE name ILIKE '%searchTerm%'
ORDER BY name
LIMIT 20
```

**Limitations:**
- ❌ No ranking/relevance scoring
- ❌ Poor performance on large datasets (doesn't use indexes efficiently)
- ❌ No support for typos or fuzzy matching
- ❌ Can't handle multiple words well
- ❌ No stemming (e.g., "develop", "developer", "developing" treated separately)

---

## Approach 1: PostgreSQL Built-in Full-Text Search (Recommended)

### ✅ Pros
- Built into PostgreSQL (no additional services)
- Good performance with proper indexes
- Supports ranking, stemming, and language-specific features
- Free and proven technology

### ⚠️ Cons
- Limited compared to dedicated search engines
- Less flexible for complex queries

### Implementation

#### 1. Update Database Schema

Add a tsvector column for full-text search:

```sql
-- Add tsvector column
ALTER TABLE skills 
ADD COLUMN search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION skills_search_vector_update() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.name, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update on INSERT/UPDATE
CREATE TRIGGER skills_search_vector_trigger
BEFORE INSERT OR UPDATE ON skills
FOR EACH ROW EXECUTE FUNCTION skills_search_vector_update();

-- Populate existing data
UPDATE skills SET search_vector = to_tsvector('english', name);

-- Create GIN index for fast searching
CREATE INDEX skills_search_idx ON skills USING GIN(search_vector);
```

#### 2. Update Go Handler

```go
func SearchSkills(c *gin.Context) {
	searchTerm := c.Query("q")
	if searchTerm == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query required"})
		return
	}

	// Use PostgreSQL full-text search with ranking
	query := `
		SELECT id, name, created_at,
		       ts_rank(search_vector, to_tsquery('english', $1)) as rank
		FROM skills
		WHERE search_vector @@ to_tsquery('english', $1)
		ORDER BY rank DESC, name
		LIMIT 20
	`

	// Format search term: replace spaces with & for AND queries
	formattedTerm := strings.ReplaceAll(searchTerm, " ", " & ") + ":*"
	
	rows, err := config.DB.Query(query, formattedTerm)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	skills := []models.Skill{}
	for rows.Next() {
		var skill models.Skill
		var rank float64
		if err := rows.Scan(&skill.ID, &skill.Name, &skill.CreatedAt, &rank); err != nil {
			continue
		}
		skills = append(skills, skill)
	}

	c.JSON(http.StatusOK, skills)
}
```

#### 3. Advanced Features

**Fuzzy matching with similarity (requires pg_trgm extension):**
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create trigram index
CREATE INDEX skills_name_trgm_idx ON skills USING GIN(name gin_trgm_ops);

-- Query with similarity
SELECT id, name, similarity(name, $1) as similarity
FROM skills
WHERE name % $1  -- % is the similarity operator
ORDER BY similarity DESC
LIMIT 20;
```

---

## Approach 2: Elasticsearch (Best for Scale)

### ✅ Pros
- Industry-standard search engine
- Extremely powerful: typo tolerance, synonyms, multi-language support
- Excellent performance at scale
- Advanced analytics and aggregations

### ⚠️ Cons
- Requires additional infrastructure
- More complex to set up and maintain
- Costs (memory/CPU intensive)
- Data synchronization needed between PostgreSQL and Elasticsearch

### Implementation

#### 1. Install Elasticsearch

```bash
# Using Docker
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  elasticsearch:8.11.0
```

#### 2. Create Index Mapping

```go
// elasticsearch/client.go
package elasticsearch

import (
	"github.com/elastic/go-elasticsearch/v8"
)

func NewClient() (*elasticsearch.Client, error) {
	return elasticsearch.NewDefaultClient()
}

func CreateSkillsIndex(client *elasticsearch.Client) error {
	mapping := `{
		"mappings": {
			"properties": {
				"id": {"type": "keyword"},
				"name": {
					"type": "text",
					"analyzer": "standard",
					"fields": {
						"keyword": {"type": "keyword"},
						"suggest": {
							"type": "completion",
							"analyzer": "simple"
						}
					}
				},
				"created_at": {"type": "date"}
			}
		},
		"settings": {
			"analysis": {
				"analyzer": {
					"autocomplete": {
						"type": "custom",
						"tokenizer": "standard",
						"filter": ["lowercase", "edge_ngram"]
					}
				},
				"filter": {
					"edge_ngram": {
						"type": "edge_ngram",
						"min_gram": 2,
						"max_gram": 10
					}
				}
			}
		}
	}`

	_, err := client.Indices.Create("skills", 
		client.Indices.Create.WithBody(strings.NewReader(mapping)))
	return err
}
```

#### 3. Sync Data

```go
func IndexSkill(client *elasticsearch.Client, skill models.Skill) error {
	data, _ := json.Marshal(skill)
	_, err := client.Index("skills", bytes.NewReader(data),
		client.Index.WithDocumentID(skill.ID))
	return err
}

func SearchSkillsElastic(client *elasticsearch.Client, query string) ([]models.Skill, error) {
	searchQuery := map[string]interface{}{
		"query": map[string]interface{}{
			"multi_match": map[string]interface{}{
				"query": query,
				"fields": []string{"name^2", "name.suggest"},
				"fuzziness": "AUTO",
			},
		},
	}

	var buf bytes.Buffer
	json.NewEncoder(&buf).Encode(searchQuery)
	
	res, err := client.Search(
		client.Search.WithIndex("skills"),
		client.Search.WithBody(&buf),
	)
	// Parse response...
}
```

---

## Approach 3: Redis Search (Fast & Lightweight)

### ✅ Pros
- Very fast in-memory search
- Simpler than Elasticsearch
- Good autocomplete support
- Can also serve as cache

### ⚠️ Cons
- Data must fit in memory
- Less features than Elasticsearch
- Requires Redis Stack (not standard Redis)

### Implementation

```bash
# Install Redis Stack
docker run -d -p 6379:6379 redis/redis-stack-server:latest
```

```go
import "github.com/RediSearch/redisearch-go/redisearch"

func InitRedisSearch() {
	client := redisearch.NewClient("localhost:6379", "skills")

	// Create index
	schema := redisearch.NewSchema(redisearch.DefaultOptions).
		AddField(redisearch.NewTextField("name")).
		AddField(redisearch.NewTextField("id"))

	client.CreateIndex(schema)
}

func SearchRedis(query string) []models.Skill {
	client := redisearch.NewClient("localhost:6379", "skills")
	
	docs, _, _ := client.Search(redisearch.NewQuery(query).
		SetReturnFields("id", "name").
		Limit(0, 20))
	
	// Convert docs to skills...
}
```

---

## Approach 4: Hybrid (PostgreSQL + Application-Level)

### Best of Both Worlds

Use PostgreSQL for persistence and light search, with application-level enhancements:

```go
func SearchSkillsHybrid(c *gin.Context) {
	searchTerm := c.Query("q")
	
	// 1. Exact match (highest priority)
	exactQuery := `SELECT id, name FROM skills WHERE LOWER(name) = LOWER($1)`
	
	// 2. Prefix match
	prefixQuery := `SELECT id, name FROM skills WHERE name ILIKE $1 || '%'`
	
	// 3. Contains match
	containsQuery := `SELECT id, name FROM skills WHERE name ILIKE '%' || $1 || '%'`
	
	// 4. Use Levenshtein distance for fuzzy (requires fuzzystrmatch extension)
	fuzzyQuery := `
		SELECT id, name, levenshtein(LOWER(name), LOWER($1)) as distance
		FROM skills
		WHERE levenshtein(LOWER(name), LOWER($1)) <= 3
		ORDER BY distance
	`
	
	// Combine results with deduplication and ranking
}
```

---

## Recommendation Matrix

| Use Case | Recommendation | Reason |
|----------|---------------|---------|
| **< 10K skills** | PostgreSQL FTS | Simple, built-in, sufficient |
| **10K - 100K skills** | PostgreSQL FTS + pg_trgm | Good balance |
| **> 100K skills** | Elasticsearch | Best performance & features |
| **Need autocomplete** | Redis Search or PostgreSQL FTS | Both work well |
| **Multi-language** | Elasticsearch | Best language support |
| **Low budget** | PostgreSQL FTS | No additional costs |

---

## Quick Win: Improved ILIKE (Minimal Changes)

If you want to improve the current implementation with minimal effort:

```go
func SearchSkills(c *gin.Context) {
	searchTerm := c.Query("q")
	if searchTerm == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query required"})
		return
	}

	// Prioritize prefix matches, then contains matches
	query := `
		SELECT id, name, created_at,
		       CASE 
		           WHEN LOWER(name) = LOWER($1) THEN 1
		           WHEN name ILIKE $1 || '%' THEN 2
		           WHEN name ILIKE '%' || $1 || '%' THEN 3
		           ELSE 4
		       END as rank
		FROM skills
		WHERE name ILIKE '%' || $1 || '%'
		ORDER BY rank, name
		LIMIT 20
	`

	rows, err := config.DB.Query(query, searchTerm)
	// ... rest of the code
}
```

This gives you:
- ✅ Exact matches first
- ✅ Prefix matches second  
- ✅ Contains matches third
- ✅ No schema changes needed

---

## Next Steps

1. **For your current scale:** Start with **PostgreSQL FTS** (Approach 1)
2. **Add migration script** to create the tsvector column and indexes
3. **Update the SearchSkills handler** with the new query
4. **Test performance** - if it's good, you're done!
5. **If you scale beyond 100K skills:** Consider Elasticsearch

Would you like me to implement any of these approaches for your project?
