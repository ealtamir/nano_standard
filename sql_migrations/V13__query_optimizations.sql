DROP TABLE IF EXISTS nano_prices_5m CASCADE;
DROP VIEW IF EXISTS nano_prices_1h CASCADE;
DROP VIEW IF EXISTS nano_prices_1d CASCADE;
DROP VIEW IF EXISTS integrated_metrics_5m CASCADE;
DROP VIEW IF EXISTS integrated_metrics_1h CASCADE;
DROP VIEW IF EXISTS integrated_metrics_1d CASCADE;

CREATE INDEX IF NOT EXISTS block_confirmations_composite_idx 
    ON block_confirmations (confirmation_type, block_subtype, confirmation_time);
    
CREATE INDEX IF NOT EXISTS block_confirmations_time_idx 
    ON block_confirmations (confirmation_time);
    
CREATE INDEX IF NOT EXISTS crypto_prices_composite_idx 
    ON crypto_prices (currency, last_updated_at);
    
CREATE INDEX IF NOT EXISTS crypto_prices_time_idx 
    ON crypto_prices (last_updated_at);


ALTER TABLE public.block_confirmations
DROP CONSTRAINT block_confirmations_pkey,
ADD PRIMARY KEY (id, confirmation_time);

SELECT create_hypertable('block_confirmations', 'confirmation_time');


ALTER TABLE crypto_prices
DROP CONSTRAINT IF EXISTS crypto_prices_pkey,
ADD PRIMARY KEY (id, last_updated_at);

SELECT create_hypertable('crypto_prices', 'last_updated_at');



-- nano_aggregate_data
CREATE MATERIALIZED VIEW nano_aggregate_data
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('5 minutes', confirmation_time AT TIME ZONE 'UTC') AS interval_time,
    SUM((amount::numeric / 1e30)) AS total_nano_transmitted,
    COUNT(*) AS confirmation_count
FROM
    block_confirmations
WHERE
    confirmation_type = 'active_quorum'
    AND block_subtype = 'send'
GROUP BY
    interval_time
WITH NO DATA;

-- crypto_price_aggregate
CREATE MATERIALIZED VIEW crypto_price_aggregate
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('5 minutes', last_updated_at AT TIME ZONE 'UTC') AS interval_time,
    currency,
    AVG(price) AS avg_price
FROM
    crypto_prices
GROUP BY
    interval_time, currency
WITH NO DATA;


CREATE INDEX ON nano_aggregate_data (interval_time);
CREATE INDEX ON crypto_price_aggregate (interval_time, currency);


-- To have the aggregates updated in real time
ALTER MATERIALIZED VIEW nano_aggregate_data SET (timescaledb.materialized_only = false);
ALTER MATERIALIZED VIEW crypto_price_aggregate SET (timescaledb.materialized_only = false);

SELECT add_continuous_aggregate_policy(
    'nano_aggregate_data',          -- Replace with your transactions CAGG name
    start_offset => INTERVAL '6 hours', -- Recompute aggregates for the last 6 hours
    end_offset => INTERVAL '5 minutes', -- Refresh up to 5 minutes before "now"
    schedule_interval => INTERVAL '5 minutes' -- Run the refresh every 5 minutes
);

SELECT add_continuous_aggregate_policy(
    'crypto_price_aggregate',       -- Replace with your prices CAGG name
    start_offset => INTERVAL '6 hours', -- Same as above
    end_offset => INTERVAL '5 minutes', -- Ensure alignment
    schedule_interval => INTERVAL '5 minutes'
);

CALL refresh_continuous_aggregate('nano_aggregate_data', NULL, NULL);
CALL refresh_continuous_aggregate('crypto_price_aggregate', NULL, NULL);

CREATE MATERIALIZED VIEW nano_prices_5m_base AS
WITH base_data AS (
    SELECT
        (ctc.interval_time + INTERVAL '5 MINUTES') AS interval_time,
        ctc.currency,
        ctg.avg_price AS price,
        ctc.total_nano_transmitted,
        (ctc.total_nano_transmitted * ctg.avg_price) AS value_transmitted_in_currency,
        ctc.confirmation_count
    FROM (
        SELECT
            na.interval_time,
            na.confirmation_count,
            na.total_nano_transmitted,
            c.currency
        FROM nano_aggregate_data na
        CROSS JOIN (
            SELECT DISTINCT currency FROM crypto_prices
        ) c
    ) ctc
    LEFT JOIN crypto_price_aggregate ctg
        ON ctc.interval_time = ctg.interval_time
       AND ctc.currency = ctg.currency
)
SELECT * FROM base_data
WITH NO DATA; -- Create empty; refresh later

CREATE INDEX ON nano_prices_5m_base (currency, interval_time);
REFRESH MATERIALIZED VIEW nano_prices_5m_base;

-- Create the materialized view
CREATE MATERIALIZED VIEW nano_prices_5m AS
SELECT
    bd.interval_time,
    bd.currency,
    COALESCE(bd.price, sub.avg_price) AS price,
    bd.total_nano_transmitted,
    COALESCE(
        bd.value_transmitted_in_currency,
        bd.total_nano_transmitted * sub.avg_price
    ) AS value_transmitted_in_currency,
    bd.confirmation_count
FROM nano_prices_5m_base bd
LEFT JOIN LATERAL (
    SELECT AVG(bd2.price) AS avg_price
    FROM nano_prices_5m_base bd2
    WHERE bd2.currency = bd.currency
      AND bd2.interval_time BETWEEN bd.interval_time - INTERVAL '15 minutes'
                               AND bd.interval_time + INTERVAL '15 minutes'
      AND bd2.price IS NOT NULL
) sub ON TRUE
WITH NO DATA; -- Again, create empty and refresh after

-- Add indexes for queries on the final MV
CREATE INDEX ON nano_prices_5m (currency, interval_time);
-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS nano_prices_5m_interval_time_idx ON nano_prices_5m (interval_time);
CREATE INDEX IF NOT EXISTS nano_prices_5m_currency_idx ON nano_prices_5m (currency);

REFRESH MATERIALIZED VIEW nano_prices_5m;


CREATE VIEW nano_prices_1h AS
    SELECT
        time_bucket('1 hour', np.interval_time) + INTERVAL '1 hour' AS interval_time,
        np.currency,
        AVG(np.price) AS price,
        SUM(np.total_nano_transmitted) AS total_nano_transmitted,
        SUM(np.value_transmitted_in_currency) AS value_transmitted_in_currency,
        SUM(np.confirmation_count) AS confirmation_count
    FROM nano_prices_5m np
    GROUP BY time_bucket('1 hour', interval_time), currency;

CREATE VIEW nano_prices_1d AS
    SELECT
        time_bucket('1 day', np.interval_time) + INTERVAL '1 day' AS interval_time,
        np.currency,
        AVG(np.price) AS price,
        SUM(np.total_nano_transmitted) AS total_nano_transmitted,
        SUM(np.value_transmitted_in_currency) AS value_transmitted_in_currency,
        SUM(np.confirmation_count) AS confirmation_count
    FROM nano_prices_5m np
    GROUP BY time_bucket('1 day', interval_time), currency;

---- GINI Calculations

CREATE MATERIALIZED VIEW per_account_amounts_5m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('5 minutes', confirmation_time) AS time_bucket,
    account,
    SUM((amount::numeric)/1e30) AS total_amount
FROM block_confirmations
WHERE confirmation_type = 'active_quorum' AND block_subtype = 'send'
GROUP BY time_bucket, account
WITH NO DATA;

-- Add indexing for faster subsequent operations:
CREATE INDEX IF NOT EXISTS per_account_amounts_5m_time_bucket_idx ON per_account_amounts_5m (time_bucket);
CREATE INDEX IF NOT EXISTS per_account_amounts_5m_time_bucket_total_amount_idx ON per_account_amounts_5m (time_bucket, total_amount);
ALTER MATERIALIZED VIEW per_account_amounts_5m SET (timescaledb.materialized_only = false);


CREATE VIEW per_account_amounts_1h AS
SELECT
    time_bucket('1 hour', time_bucket) + INTERVAL '1 hour' AS time_bucket,
    account,
    SUM(total_amount) AS total_amount
FROM per_account_amounts_5m
GROUP BY time_bucket, account;

CREATE VIEW per_account_amounts_1d AS
SELECT
    time_bucket('1 day', time_bucket) + INTERVAL '1 day' AS time_bucket,
    account,
    SUM(total_amount) AS total_amount
FROM per_account_amounts_5m
GROUP BY time_bucket, account;

CREATE OR REPLACE FUNCTION compute_gini(amounts numeric[])
RETURNS numeric AS $$
DECLARE
    sorted_amounts numeric[];
    N int;
    sum_i_xi numeric := 0;
    cumulative_total numeric := 0;
    i int;
BEGIN
    -- Handle empty or null arrays:
    N := array_length(amounts, 1);
    IF N IS NULL OR N = 0 THEN
        RETURN 0;
    END IF;

    -- Sort the amounts in ascending order:
    SELECT array_agg(a ORDER BY a) INTO sorted_amounts
    FROM unnest(amounts) a;

    -- Compute the cumulative total:
    SELECT sum(a) INTO cumulative_total
    FROM unnest(amounts) a;

    IF cumulative_total = 0 THEN
        RETURN 0;
    END IF;

    -- sum_i_xi = Σ(i * x_i)
    FOR i IN 1..N LOOP
        sum_i_xi := sum_i_xi + (i * sorted_amounts[i]);
    END LOOP;

    RETURN ((2 * sum_i_xi) / (N * cumulative_total)) - ((N + 1)::numeric / N);
END;
$$ LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE VIEW gini_coefficient_5m AS
SELECT
    time_bucket + INTERVAL '5 minutes' AS time_bucket,
    compute_gini(array_agg(total_amount)) AS gini_coefficient
FROM per_account_amounts_5m
GROUP BY time_bucket;

CREATE OR REPLACE VIEW gini_coefficient_1h AS
SELECT
    time_bucket + INTERVAL '1 hour' AS time_bucket,
    compute_gini(array_agg(total_amount)) AS gini_coefficient
FROM per_account_amounts_1h
GROUP BY time_bucket;

CREATE OR REPLACE VIEW gini_coefficient_1d AS
SELECT
    time_bucket + INTERVAL '1 day' AS time_bucket,
    compute_gini(array_agg(total_amount)) AS gini_coefficient
FROM per_account_amounts_1d
GROUP BY time_bucket;

CREATE OR REPLACE VIEW integrated_metrics_5m AS
SELECT
    np.interval_time,
    np.currency,
    np.price,
    np.total_nano_transmitted,
    np.value_transmitted_in_currency,
    np.confirmation_count,
    g.gini_coefficient
FROM nano_prices_5m np
LEFT JOIN gini_coefficient_5m g
    ON np.interval_time = g.time_bucket;

CREATE OR REPLACE VIEW integrated_metrics_1h AS
SELECT
    np.interval_time,
    np.currency,
    np.price,
    np.total_nano_transmitted,
    np.value_transmitted_in_currency,
    np.confirmation_count,
    g.gini_coefficient
FROM nano_prices_1h np
LEFT JOIN gini_coefficient_1h g
    ON np.interval_time = g.time_bucket;

CREATE OR REPLACE VIEW integrated_metrics_1d AS
SELECT
    np.interval_time,
    np.currency,
    np.price,
    np.total_nano_transmitted,
    np.value_transmitted_in_currency,
    np.confirmation_count,
    g.gini_coefficient
FROM nano_prices_1d np
LEFT JOIN gini_coefficient_1d g
    ON np.interval_time = g.time_bucket;