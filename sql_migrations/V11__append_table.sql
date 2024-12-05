DROP VIEW IF EXISTS nano_prices_1h CASCADE;
DROP VIEW IF EXISTS nano_prices_1d CASCADE;
DROP MATERIALIZED VIEW IF EXISTS nano_prices_5m CASCADE;
DROP VIEW IF EXISTS integrated_metrics_5m CASCADE;
DROP VIEW IF EXISTS integrated_metrics_1h CASCADE;
DROP VIEW IF EXISTS integrated_metrics_1d CASCADE;

CREATE TABLE nano_prices_5m (
    interval_time TIMESTAMP,
    currency TEXT,
    price NUMERIC,
    total_nano_transmitted NUMERIC,
    value_transmitted_in_currency NUMERIC,
    confirmation_count INTEGER,
    PRIMARY KEY (interval_time, currency)
);

INSERT INTO nano_prices_5m
    WITH normalized_transactions AS (
        SELECT
            bc.confirmation_time,
            (bc.amount::numeric / 1e30) AS amount_nano
        FROM
            block_confirmations bc
        WHERE bc.confirmation_type = 'active_quorum' and bc.block_subtype = 'send'
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
;

-- Create index to improve query performance
CREATE INDEX ON nano_prices_5m (interval_time);
CREATE INDEX ON nano_prices_5m (currency);


CREATE OR REPLACE FUNCTION update_nano_prices()
RETURNS void AS $$
BEGIN
    INSERT INTO nano_prices_5m (interval_time, currency, price, total_nano_transmitted, value_transmitted_in_currency, confirmation_count)
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
                AND cp.last_updated_at > NOW() - INTERVAL '5 minutes' -- Include only updates from the last 5 minutes
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
            fr.*
        FROM
            final_result fr
        LEFT JOIN nano_prices_5m np
            ON fr.interval_time = np.interval_time AND fr.currency = np.currency
        WHERE np.interval_time IS NULL -- Exclude already present rows
    ) fr;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW nano_prices_1h AS
    SELECT
        time_bucket('1 hour', interval_time) AS interval_1h,
        currency,
        SUM(total_nano_transmitted) AS total_nano_transmitted,
        last(price, interval_time) AS price,
        SUM(total_nano_transmitted) * last(price, interval_time) AS value_transmitted_in_currency,
        SUM(confirmation_count) AS confirmation_count
    FROM
        nano_prices_5m
    GROUP BY
        interval_1h,
        currency
;

CREATE OR REPLACE VIEW nano_prices_1d AS
    SELECT
        time_bucket('1 day', interval_time) AS interval_1d,
        currency,
        SUM(total_nano_transmitted) AS total_nano_transmitted,
        last(price, interval_time) AS price,
        SUM(total_nano_transmitted) * last(price, interval_time) AS value_transmitted_in_currency,
        SUM(confirmation_count) AS confirmation_count
    FROM
        nano_prices_5m
    GROUP BY
        interval_1d,
        currency
;


CREATE OR REPLACE VIEW integrated_metrics_5m AS
    SELECT
        time_bucket('5 minutes', np.interval_time) AS interval_time,
        np.currency,
        np.price,
        np.total_nano_transmitted,
        np.value_transmitted_in_currency,
        np.confirmation_count,
        g.gini_coefficient
    FROM
        nano_prices_5m np
    LEFT JOIN gini_coefficient_5m g
        ON time_bucket('5 minutes', np.interval_time) = time_bucket('5 minutes', g.time_bucket);

CREATE OR REPLACE VIEW integrated_metrics_1h AS
    SELECT
        time_bucket('1 hour', np.interval_1h) AS interval_time,
        np.currency,
        np.price,
        np.total_nano_transmitted,
        np.value_transmitted_in_currency,
        np.confirmation_count,
        g.gini_coefficient
    FROM
        nano_prices_1h np
    LEFT JOIN gini_coefficient_1h g
        ON time_bucket('1 hour', np.interval_1h) = time_bucket('1 hour', g.time_bucket);

CREATE OR REPLACE VIEW integrated_metrics_1d AS
    SELECT
        time_bucket('1 day', np.interval_1d) AS interval_time,
        np.currency,
        np.price,
        np.total_nano_transmitted,
        np.value_transmitted_in_currency,
        np.confirmation_count,
        g.gini_coefficient
    FROM
        nano_prices_1d np
    LEFT JOIN gini_coefficient_1d g
        ON time_bucket('1 day', np.interval_1d) = time_bucket('1 day', g.time_bucket);