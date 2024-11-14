-- Create a new Flyway migration script, e.g., V2__modify_block_confirmations.sql

-- Step 1: Add the new BIGSERIAL column as an ID column
ALTER TABLE public.block_confirmations
    ADD COLUMN id BIGSERIAL;

-- Step 2: Drop the current primary key constraint on `hash`
ALTER TABLE public.block_confirmations
    DROP CONSTRAINT IF EXISTS block_confirmations_pkey;

-- Step 3: Set the new `id` column as the primary key
ALTER TABLE public.block_confirmations
    ADD PRIMARY KEY (id);

-- Step 4: Drop unwanted columns
ALTER TABLE public.block_confirmations
    DROP COLUMN IF EXISTS hash,
    DROP COLUMN IF EXISTS topic,
    DROP COLUMN IF EXISTS block_type,
    DROP COLUMN IF EXISTS previous_block,
    DROP COLUMN IF EXISTS link,
    DROP COLUMN IF EXISTS signature,
    DROP COLUMN IF EXISTS work;