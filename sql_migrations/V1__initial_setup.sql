CREATE TABLE IF NOT EXISTS public.block_confirmations (
    -- Primary key (using the block hash)
    hash VARCHAR(64) PRIMARY KEY,
    
    -- Confirmation metadata
    topic VARCHAR(32) NOT NULL,
    confirmation_time TIMESTAMP WITH TIME ZONE NOT NULL,  -- Converted from Unix timestamp
    confirmation_type VARCHAR(32) NOT NULL,
    
    -- Transaction details
    account VARCHAR(65) NOT NULL,  -- nano_ addresses are typically 65 chars
    amount VARCHAR(39) NOT NULL,    -- Raw amount as string (large numbers)
    
    -- Block details
    block_type VARCHAR(10) NOT NULL,
    block_subtype VARCHAR(10) NOT NULL,
    previous_block VARCHAR(64) NOT NULL,
    representative VARCHAR(65) NOT NULL,
    balance VARCHAR(39) NOT NULL,    -- Raw balance as string
    link VARCHAR(64) NOT NULL,
    link_as_account VARCHAR(65) NOT NULL,
    signature VARCHAR(128) NOT NULL,
    work VARCHAR(16) NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on confirmation time for efficient querying
CREATE INDEX IF NOT EXISTS idx_block_confirmations_time ON block_confirmations(confirmation_time);

-- Create an index on account for efficient lookups
CREATE INDEX IF NOT EXISTS idx_block_confirmations_account ON block_confirmations(account);
