-- 20260603_fix_resonance_dimensions.sql
-- Fix resonance engine dimensionality to match gemini-embedding-001 (3072 dims)

-- 1. Ensure pgvector extension is active
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add correct embedding column
ALTER TABLE fragrances ADD COLUMN IF NOT EXISTS embedding vector(3072);

-- 3. Backfill embedding from primary_vector (text to vector cast)
-- This assumes primary_vector contains the JSON array string
UPDATE fragrances 
SET embedding = primary_vector::vector 
WHERE primary_vector IS NOT NULL 
  AND embedding IS NULL;

-- 4. Create the resonance_match function with correct dimensions
CREATE OR REPLACE FUNCTION resonance_match(
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  brand text,
  name text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fragrances.id,
    fragrances.brand,
    fragrances.name,
    1 - (fragrances.embedding <=> query_embedding) AS similarity
  FROM fragrances
  WHERE 1 - (fragrances.embedding <=> query_embedding) > match_threshold
  ORDER BY fragrances.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
