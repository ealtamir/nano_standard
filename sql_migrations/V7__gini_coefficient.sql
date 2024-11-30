CREATE OR REPLACE VIEW gini_coefficient_5m AS
WITH per_account_amounts AS (
  SELECT
    time_bucket('5 minutes', confirmation_time) AS time_bucket, -- Adjust the interval as needed
    account,
    SUM(CAST(amount AS numeric)) AS total_amount
  FROM
    block_confirmations
  WHERE confirmation_type = 'active_quorum' and block_subtype = 'send'
  GROUP BY
    time_bucket, account
),
ranked_amounts AS (
  SELECT
    time_bucket,
    account,
    total_amount,
    ROW_NUMBER() OVER (PARTITION BY time_bucket ORDER BY total_amount) AS i,
    COUNT(*) OVER (PARTITION BY time_bucket) AS N,
    SUM(total_amount) OVER (PARTITION BY time_bucket) AS cumulative_total
  FROM
    per_account_amounts
),
gini_calculations AS (
  SELECT
    time_bucket,
    SUM(i * total_amount) AS sum_i_xi,
    MAX(N) AS N,
    MAX(cumulative_total) AS cumulative_total
  FROM
    ranked_amounts
  GROUP BY
    time_bucket
)
SELECT
  time_bucket,
  CASE
    WHEN cumulative_total = 0 OR N = 0 THEN 0
    ELSE (2 * sum_i_xi) / (N * cumulative_total) - (N + 1)::numeric / N
  END AS gini_coefficient
FROM
  gini_calculations
ORDER BY
  time_bucket;


CREATE OR REPLACE VIEW gini_coefficient_1h AS
WITH per_account_amounts AS (
  SELECT
    time_bucket('1 hour', confirmation_time) AS time_bucket, -- Adjust the interval as needed
    account,
    SUM(CAST(amount AS numeric)) AS total_amount
  FROM
    block_confirmations
  WHERE confirmation_type = 'active_quorum' and block_subtype = 'send'
  GROUP BY
    time_bucket, account
),
ranked_amounts AS (
  SELECT
    time_bucket,
    account,
    total_amount,
    ROW_NUMBER() OVER (PARTITION BY time_bucket ORDER BY total_amount) AS i,
    COUNT(*) OVER (PARTITION BY time_bucket) AS N,
    SUM(total_amount) OVER (PARTITION BY time_bucket) AS cumulative_total
  FROM
    per_account_amounts
),
gini_calculations AS (
  SELECT
    time_bucket,
    SUM(i * total_amount) AS sum_i_xi,
    MAX(N) AS N,
    MAX(cumulative_total) AS cumulative_total
  FROM
    ranked_amounts
  GROUP BY
    time_bucket
)
SELECT
  time_bucket,
  CASE
    WHEN cumulative_total = 0 OR N = 0 THEN 0
    ELSE (2 * sum_i_xi) / (N * cumulative_total) - (N + 1)::numeric / N
  END AS gini_coefficient
FROM
  gini_calculations
ORDER BY
  time_bucket;


CREATE OR REPLACE VIEW gini_coefficient_1d AS
WITH per_account_amounts AS (
  SELECT
    time_bucket('1 day', confirmation_time) AS time_bucket, -- Adjust the interval as needed
    account,
    SUM(CAST(amount AS numeric)) AS total_amount
  FROM
    block_confirmations
  WHERE confirmation_type = 'active_quorum' and block_subtype = 'send'
  GROUP BY
    time_bucket, account
),
ranked_amounts AS (
  SELECT
    time_bucket,
    account,
    total_amount,
    ROW_NUMBER() OVER (PARTITION BY time_bucket ORDER BY total_amount) AS i,
    COUNT(*) OVER (PARTITION BY time_bucket) AS N,
    SUM(total_amount) OVER (PARTITION BY time_bucket) AS cumulative_total
  FROM
    per_account_amounts
),
gini_calculations AS (
  SELECT
    time_bucket,
    SUM(i * total_amount) AS sum_i_xi,
    MAX(N) AS N,
    MAX(cumulative_total) AS cumulative_total
  FROM
    ranked_amounts
  GROUP BY
    time_bucket
)
SELECT
  time_bucket,
  CASE
    WHEN cumulative_total = 0 OR N = 0 THEN 0
    ELSE (2 * sum_i_xi) / (N * cumulative_total) - (N + 1)::numeric / N
  END AS gini_coefficient
FROM
  gini_calculations
ORDER BY
  time_bucket;