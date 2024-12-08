-- Add processed column with default value of false
ALTER TABLE block_confirmations 
ADD COLUMN processed BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index on processed column
CREATE INDEX idx_block_confirmations_processed 
ON block_confirmations(processed);

DELETE FROM nano_prices_5m WHERE 1 = 1;

CREATE OR REPLACE FUNCTION update_nano_prices()
RETURNS void AS $$
DECLARE
    current_bucket TIMESTAMP;
    previous_bucket TIMESTAMP;
BEGIN
    -- Calculate the current and previous 5-minute buckets
    current_bucket := date_trunc('hour', NOW()) + 
                     INTERVAL '5 minutes' * (date_part('minute', NOW())::integer / 5);
    previous_bucket := current_bucket - INTERVAL '5 minutes';

    -- Delete data from the last 10 minutes (2 buckets)
    DELETE FROM nano_prices_5m 
    WHERE interval_time >= previous_bucket;

    -- Insert new data using transactions only from the relevant time period
    INSERT INTO nano_prices_5m (
        interval_time, 
        currency, 
        price, 
        total_nano_transmitted, 
        value_transmitted_in_currency, 
        confirmation_count
    )
    SELECT
        fr.interval_time,
        fr.currency,
        fr.price,
        fr.total_nano_transmitted,
        fr.value_transmitted_in_currency,
        fr.confirmation_count
    FROM (
        WITH normalized_transactions AS (
            SELECT
                bc.confirmation_time,
                (bc.amount::numeric / 1e30) AS amount_nano
            FROM
                block_confirmations bc
            WHERE bc.confirmation_type = 'active_quorum' 
                AND bc.block_subtype = 'send'
                AND bc.confirmation_time >= previous_bucket
        ),
        aggregated_transactions AS (
            SELECT
                time_bucket('5 minutes', nt.confirmation_time) AS interval_time,
                SUM(nt.amount_nano) AS total_nano_transmitted,
                COUNT(*) AS confirmation_count
            FROM
                normalized_transactions nt
            GROUP BY
                interval_time
        ),
        currencies AS (
            SELECT DISTINCT currency
            FROM crypto_prices
            WHERE symbol = 'NANO'
        ),
        intervals AS (
            SELECT DISTINCT interval_time
            FROM aggregated_transactions
        ),
        interval_currency_pairs AS (
            SELECT i.interval_time, c.currency
            FROM intervals i CROSS JOIN currencies c
        ),
        latest_prices AS (
            SELECT
                cp.currency,
                cp.last_updated_at,
                cp.price,
                i.interval_time,
                ROW_NUMBER() OVER (
                    PARTITION BY i.interval_time, cp.currency
                    ORDER BY cp.last_updated_at DESC
                ) AS rn
            FROM
                crypto_prices cp
            INNER JOIN interval_currency_pairs i
                ON cp.currency = i.currency
                AND cp.last_updated_at <= i.interval_time
            WHERE
                cp.symbol = 'NANO'
        ),
        selected_prices AS (
            SELECT
                currency,
                interval_time,
                price
            FROM
                latest_prices
            WHERE rn = 1
        ),
        final_result AS (
            SELECT
                at.interval_time,
                sp.currency,
                sp.price,
                at.total_nano_transmitted,
                at.total_nano_transmitted * sp.price AS value_transmitted_in_currency,
                at.confirmation_count
            FROM
                aggregated_transactions at
            INNER JOIN selected_prices sp
                ON at.interval_time = sp.interval_time
        )
        SELECT
            interval_time,
            currency,
            price,
            total_nano_transmitted,
            value_transmitted_in_currency,
            confirmation_count
        FROM
            final_result
        WHERE interval_time >= previous_bucket
    ) fr;

EXCEPTION 
    WHEN OTHERS THEN
        -- Log error details
        RAISE NOTICE 'Error occurred: % %', SQLERRM, SQLSTATE;
        
        -- Re-raise the error to the caller
        RAISE;
END;
$$ LANGUAGE plpgsql;

SELECT update_nano_prices();