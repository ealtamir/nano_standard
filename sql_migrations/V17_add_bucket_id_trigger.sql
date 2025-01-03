-- Create the trigger function
CREATE OR REPLACE FUNCTION set_bucket_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set bucket_id for send and receive transactions
    IF NEW.block_subtype IN ('send', 'receive') THEN
        NEW.bucket_id := get_bucket_id(NEW.balance::numeric);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER set_bucket_id_trigger
    BEFORE INSERT ON block_confirmations
    FOR EACH ROW
    EXECUTE FUNCTION set_bucket_id();

-- Add comment explaining the trigger
COMMENT ON FUNCTION set_bucket_id() IS 'Trigger function to automatically set bucket_id for send and receive transactions based on their amount'; 