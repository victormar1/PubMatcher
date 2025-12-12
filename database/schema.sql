-- ===========================================
-- PubMatcher Database Schema
-- PostgreSQL 14+
-- ===========================================

-- ===========================================
-- Users table
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Researched queries (for caching)
-- ===========================================
CREATE TABLE IF NOT EXISTS researched_queries (
    id SERIAL PRIMARY KEY,
    query_hash VARCHAR(64) UNIQUE NOT NULL,
    genes TEXT NOT NULL,
    phenotypes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Query results cache
-- ===========================================
CREATE TABLE IF NOT EXISTS query_results (
    id SERIAL PRIMARY KEY,
    query_id INTEGER REFERENCES researched_queries(id) ON DELETE CASCADE,
    result_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- ===========================================
-- Search history
-- ===========================================
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    query_id INTEGER REFERENCES researched_queries(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Password reset tokens
-- ===========================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Indexes for performance
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_queries_hash ON researched_queries(query_hash);
CREATE INDEX IF NOT EXISTS idx_queries_last_used ON researched_queries(last_used_at);
CREATE INDEX IF NOT EXISTS idx_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_timestamp ON search_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_results_query ON query_results(query_id);
CREATE INDEX IF NOT EXISTS idx_results_expires ON query_results(expires_at);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires ON password_reset_tokens(expires_at);

-- ===========================================
-- Cleanup function for expired data
-- ===========================================
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- Remove expired query results
    DELETE FROM query_results WHERE expires_at < CURRENT_TIMESTAMP;
    
    -- Remove expired password reset tokens
    DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup daily
-- (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired', '0 3 * * *', 'SELECT cleanup_expired_data()');

