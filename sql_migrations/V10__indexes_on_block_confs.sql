-- Add indexes for frequently filtered columns
CREATE INDEX idx_block_confirmations_confirmation_type ON block_confirmations (confirmation_type);
CREATE INDEX idx_block_confirmations_block_subtype ON block_confirmations (block_subtype);
