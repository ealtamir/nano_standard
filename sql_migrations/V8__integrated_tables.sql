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
