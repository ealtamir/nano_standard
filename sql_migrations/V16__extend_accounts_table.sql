ALTER TABLE accounts
ADD COLUMN partners_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN balance_history_size INTEGER NOT NULL DEFAULT 0,
ADD COLUMN transaction_types JSONB,
ADD COLUMN bucket_id INTEGER NOT NULL DEFAULT -1;

-- Create the trigger function for accounts
CREATE OR REPLACE FUNCTION set_account_bucket_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bucket_id := get_bucket_id(NEW.balance::numeric);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER set_account_bucket_id_trigger
    BEFORE INSERT ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION set_account_bucket_id();

-- Add comment explaining the trigger
COMMENT ON FUNCTION set_account_bucket_id() IS 'Trigger function to automatically set bucket_id for accounts based on their balance';


