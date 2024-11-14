CREATE TABLE IF NOT EXISTS crypto_prices (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    market_cap DECIMAL(20, 2),
    volume_24h DECIMAL(20, 4),
    percent_change_24h DECIMAL(10, 8),
    last_updated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on symbol, currency and last_updated_at for efficient querying
CREATE INDEX idx_crypto_prices_symbol_currency_updated 
ON crypto_prices(symbol, currency, last_updated_at);

-- Add a unique constraint to prevent duplicate entries for the same symbol, currency and timestamp
CREATE UNIQUE INDEX idx_crypto_prices_unique 
ON crypto_prices(symbol, currency, last_updated_at);

CREATE TABLE IF NOT EXISTS metal_prices (
    id SERIAL PRIMARY KEY,
    metal VARCHAR(10) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    prev_close_price DECIMAL(20, 3),
    open_price DECIMAL(20, 3),
    low_price DECIMAL(20, 3),
    high_price DECIMAL(20, 3),
    open_time TIMESTAMP,
    price DECIMAL(20, 3) NOT NULL,
    change_amount DECIMAL(10, 3),
    change_percentage DECIMAL(10, 3),
    ask DECIMAL(20, 3),
    bid DECIMAL(20, 3),
    price_gram_24k DECIMAL(20, 4),
    price_gram_22k DECIMAL(20, 4),
    price_gram_21k DECIMAL(20, 4),
    price_gram_20k DECIMAL(20, 4),
    price_gram_18k DECIMAL(20, 4),
    price_gram_16k DECIMAL(20, 4),
    price_gram_14k DECIMAL(20, 4),
    price_gram_10k DECIMAL(20, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on metal, currency, exchange and timestamp for efficient querying
CREATE INDEX idx_metal_prices_lookup 
ON metal_prices(metal, currency, exchange, timestamp);

-- Add a unique constraint to prevent duplicate entries
CREATE UNIQUE INDEX idx_metal_prices_unique 
ON metal_prices(metal, currency, exchange, timestamp);


