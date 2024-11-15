-- Time series for 5m buckets
CREATE OR REPLACE VIEW nano_prices_5m AS
    WITH normalized_transactions AS (
        SELECT
            bc.confirmation_time,
            (bc.amount::numeric / 1e30) AS amount_nano
        FROM
            block_confirmations bc
    ),
    aggregated_transactions AS (
        SELECT
            time_bucket('5 minutes', nt.confirmation_time) AS interval_time,
            SUM(nt.amount_nano) AS total_nano_transmitted
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
            at.total_nano_transmitted * sp.price AS value_transmitted_in_currency
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
        value_transmitted_in_currency
    FROM
        final_result

CREATE OR REPLACE VIEW nano_prices_1h AS
    SELECT
        time_bucket('1 hour', interval_time) AS interval_1h,
        currency,
        SUM(total_nano_transmitted) AS total_nano_transmitted,
        last(price, interval_time) AS price,
        SUM(total_nano_transmitted) * last(price, interval_time) AS value_transmitted_in_currency
    FROM
        nano_prices_5m
    GROUP BY
        interval_1h,
        currency

CREATE OR REPLACE VIEW nano_prices_1d AS
    SELECT
        time_bucket('1 day', interval_time) AS interval_1d,
        currency,
        SUM(total_nano_transmitted) AS total_nano_transmitted,
        last(price, interval_time) AS price,
        SUM(total_nano_transmitted) * last(price, interval_time) AS value_transmitted_in_currency
    FROM
        nano_prices_5m
    GROUP BY
        interval_1d,
        currency