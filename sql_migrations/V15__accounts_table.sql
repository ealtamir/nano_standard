CREATE TABLE accounts (
    account VARCHAR(65) PRIMARY KEY,
    balance NUMERIC(39) NOT NULL DEFAULT 0,
    max_balance NUMERIC(39) NOT NULL DEFAULT 0,
    max_send_amount NUMERIC(39) NOT NULL DEFAULT 0,
    max_receive_amount NUMERIC(39) NOT NULL DEFAULT 0,
    transaction_count INTEGER NOT NULL DEFAULT 0,
    representatives_count INTEGER NOT NULL DEFAULT 0,
    transaction_count_by_type JSONB,
    representatives JSONB,
    transaction_timestamps_by_type JSONB,
    partners JSONB,
    balance_history JSONB,
    open_timestamp BIGINT NOT NULL,
    last_send_timestamp BIGINT,
    last_receive_timestamp BIGINT,
    last_block_timestamp BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger function that only updates updated_at
CREATE OR REPLACE FUNCTION update_timestamps_column()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = CURRENT_TIMESTAMP;
        NEW.updated_at = CURRENT_TIMESTAMP;
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.created_at = OLD.created_at;  -- Preserve the original created_at
        NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger that fires on both INSERT and UPDATE
CREATE TRIGGER update_accounts_timestamps
    BEFORE INSERT OR UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamps_column();

-- Create indexes
CREATE INDEX idx_accounts_balance ON accounts(balance);
CREATE INDEX idx_accounts_last_block_timestamp ON accounts(last_block_timestamp);
CREATE INDEX idx_accounts_transaction_count ON accounts(transaction_count);
CREATE INDEX idx_accounts_updated_at ON accounts(updated_at);
CREATE INDEX idx_accounts_open_timestamp ON accounts(open_timestamp);