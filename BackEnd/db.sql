CREATE TABLE links (
	id SERIAL PRIMARY KEY,
	longurl TEXT NOT NULL,
	shorturlid VARCHAR(15) UNIQUE NOT NULL,
	max_uses INT DEFAULT 5,
	created_at TIMESTAMP DEFAULT NOW()

);