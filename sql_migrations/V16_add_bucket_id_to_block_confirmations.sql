-- Add the bucket_id column
ALTER TABLE block_confirmations
ADD COLUMN bucket_id INTEGER CHECK (bucket_id >= 0 AND bucket_id <= 63);

-- Create an index for efficient bucket_id lookups
CREATE INDEX idx_block_confirmations_bucket_id ON block_confirmations(bucket_id);

-- Update existing records with bucket_id based on amount
-- We'll use width_bucket to assign IDs based on the amount ranges
WITH amount_ranges AS (
    SELECT 
        bucket_id,
        nano_lower_bound,
        nano_upper_bound
    FROM nano_buckets 
    WHERE currency = 'USD'  -- Using USD as reference for the ranges
    ORDER BY bucket_id
)
UPDATE block_confirmations bc
SET bucket_id = ar.bucket_id
FROM amount_ranges ar
WHERE (bc.amount::numeric) >= ar.nano_lower_bound 
AND (bc.amount::numeric) < ar.nano_upper_bound;

-- Add a comment explaining the bucket_id field
COMMENT ON COLUMN block_confirmations.bucket_id IS 'Bucket identifier (0-63) representing the range of the transaction amount'; 