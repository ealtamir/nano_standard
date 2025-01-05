import { sql } from "../../db.ts";
import { logger } from "../../logger.ts";
import { config } from "../../config_loader.ts";

type Interval = "5m" | "1h" | "1d";

/**
 * Manages database queries for the application
 * Groups related queries together and provides a centralized place for SQL operations
 */
export class QueryManager {
  /**
   * Example query method showing parameterized query pattern
   */

  static async getNanoVolume(
    interval: Interval,
  ): Promise<Array<Record<string, unknown>>> {
    let bucket = "";
    let range = "";
    let gini_table = "";
    let median_interval = "";
    if (interval === "5m") {
      bucket = "5 minutes";
      range = config.propagator.range_5m;
      gini_table = "gini_coefficient_5m";
      median_interval = config.propagator.median_5m;
    } else if (interval === "1h") {
      bucket = "1 hour";
      range = config.propagator.range_1h;
      gini_table = "gini_coefficient_1h";
      median_interval = config.propagator.median_1h;
    } else if (interval === "1d") {
      bucket = "1 day";
      range = config.propagator.range_1d;
      gini_table = "gini_coefficient_1d";
      median_interval = config.propagator.median_1d;
    }
    try {
      return await sql<Array<Record<string, unknown>>>`
        WITH base_data AS (
            SELECT 
                time_bucket('${sql(bucket)}'::interval, confirmation_time) + '${
        sql(bucket)
      }'::interval AS time_bucket,
                SUM(amount::numeric / 1e30) AS amount_nano
            FROM
                block_confirmations
            WHERE
                block_subtype = 'send'
                AND confirmation_type = 'active_quorum'
                AND confirmation_time >= NOW() - '${sql(range)}'::interval
            GROUP BY
                time_bucket
        )
        SELECT
            bd1.time_bucket AS time_bucket,
            CAST(bd1.amount_nano AS double precision) AS amount_nano,
            CAST((
                SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY bd2.amount_nano)
                FROM base_data bd2
                WHERE bd2.time_bucket BETWEEN bd1.time_bucket - '${
        sql(median_interval)
      }'::interval AND bd1.time_bucket
            ) AS double precision) AS rolling_median,
            CAST(gini.gini_coefficient AS double precision) AS gini_coefficient
        FROM
            base_data bd1
        JOIN ${sql(gini_table)} gini ON bd1.time_bucket = gini.time_bucket
        WHERE bd1.time_bucket <= NOW()
        ORDER BY
            bd1.time_bucket;
      `;
    } catch (error) {
      await logger.log(`Error in getNanoVolume: ${error}`, "ERROR");
      throw error;
    }
  }

  static async getNanoPrices(
    interval: Interval,
  ): Promise<Array<Record<string, unknown>>> {
    let range = "";
    let median_interval = "";
    let table_name = "";
    if (interval === "5m") {
      range = config.propagator.range_5m;
      median_interval = config.propagator.median_5m;
      table_name = "nano_prices_5m";
    } else if (interval === "1h") {
      range = config.propagator.range_1h;
      median_interval = config.propagator.median_1h;
      table_name = "nano_prices_1h";
    } else if (interval === "1d") {
      range = config.propagator.range_1d;
      median_interval = config.propagator.median_1d;
      table_name = "nano_prices_1d";
    }

    try {
      return await sql<Array<Record<string, unknown>>>`
        SELECT
            interval_time as time_bucket,
            currency,
            CAST(price AS double precision) AS price,
            CAST(value_transmitted_in_currency AS double precision) AS value_transmitted_in_currency,
            (
                SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY np2.value_transmitted_in_currency)
                FROM ${sql(table_name)} np2
                WHERE np2.currency = np1.currency
                  AND np2.interval_time BETWEEN np1.interval_time - '${
        sql(median_interval)
      }'::interval AND np1.interval_time
            ) AS rolling_median
        FROM
            ${sql(table_name)} np1
        WHERE
            price IS NOT NULL
            AND interval_time >= NOW() - '${sql(range)}'::interval
            AND interval_time <= NOW()
        ORDER BY interval_time;
      `;
    } catch (error) {
      await logger.log(`Error in getNanoPrices: ${error}`, "ERROR");
      throw error;
    }
  }

  static async getNanoConfirmations(
    interval: Interval,
  ): Promise<Array<Record<string, unknown>>> {
    let range = "";
    let bucket = "";
    if (interval === "5m") {
      range = config.propagator.range_5m;
      bucket = "5 minutes";
    } else if (interval === "1h") {
      range = config.propagator.range_1h;
      bucket = "1 hour";
    } else if (interval === "1d") {
      range = config.propagator.range_1d;
      bucket = "1 day";
    }

    try {
      return await sql<Array<Record<string, unknown>>>`
        WITH aggregated_buckets AS (
            SELECT
                time_bucket('${sql(bucket)}', confirmation_time) + '${
        sql(bucket)
      }'::interval AS time_bucket,
                COUNT(*) AS confirmations
            FROM
                block_confirmations
            WHERE
                block_subtype = 'send'
                AND confirmation_type = 'active_quorum'
                AND confirmation_time >= NOW() - '${sql(range)}'::interval
            GROUP BY time_bucket
        ),
        all_buckets_within_window AS (
            SELECT
                outer_bucket.time_bucket AS time_bucket,
                outer_bucket.confirmations AS current_confirmations,
                sub_bucket.confirmations AS window_confirmations
            FROM
                aggregated_buckets AS outer_bucket
            JOIN
                aggregated_buckets AS sub_bucket
            ON
                sub_bucket.time_bucket BETWEEN outer_bucket.time_bucket - '${
        sql(range)
      }'::interval AND outer_bucket.time_bucket
        )
        SELECT
            time_bucket,
            CAST(current_confirmations AS double precision) AS current_confirmations,
            CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY window_confirmations) AS double precision) AS rolling_median,
            CAST(SUM(current_confirmations) OVER (
                ORDER BY time_bucket
            ) AS double precision) AS cumulative_sum_confirmations
        FROM
            all_buckets_within_window
        WHERE time_bucket >= NOW() - '${
        sql(range)
      }'::interval AND time_bucket <= NOW()
        GROUP BY time_bucket, current_confirmations
        ORDER BY time_bucket;
      `;
    } catch (error) {
      await logger.log(`Error in getNanoPrices: ${error}`, "ERROR");
      throw error;
    }
  }

  static async getNanoUniqueAccounts(
    interval: Interval,
  ): Promise<Array<Record<string, unknown>>> {
    let range = "";
    let bucket = "";
    let median = "";
    if (interval === "5m") {
      range = config.propagator.range_5m;
      bucket = "5 minutes";
      median = config.propagator.median_5m;
    } else if (interval === "1h") {
      range = config.propagator.range_1h;
      bucket = "1 hour";
      median = config.propagator.median_1h;
    } else if (interval === "1d") {
      range = config.propagator.range_1d;
      bucket = "1 day";
      median = config.propagator.median_1d;
    }
    try {
      return await sql<Array<Record<string, unknown>>>`
WITH first_occurrence AS (
    SELECT
        account,
        confirmation_time,
        ROW_NUMBER() OVER (
            PARTITION BY account
            ORDER BY confirmation_time ASC
        ) AS row_num
    FROM block_confirmations
    WHERE
        block_subtype = 'send'
        AND confirmation_type = 'active_quorum'
        AND confirmation_time >= NOW() - '${sql(range)}'::interval
),
distinct_accounts AS (
    SELECT
        time_bucket('${sql(bucket)}', confirmation_time) + '${
        sql(bucket)
      }'::interval AS time_bucket,
        COUNT(account) account_num
    FROM first_occurrence
    WHERE row_num = 1
    GROUP BY time_bucket
),
cumulative_accounts AS (
    SELECT
        time_bucket('${sql(bucket)}', confirmation_time) + '${
        sql(bucket)
      }'::interval AS time_bucket,
        COUNT(DISTINCT account) AS new_accounts
    FROM first_occurrence
    GROUP BY time_bucket
    ORDER BY time_bucket
),
cumulative_sum AS (
    SELECT
        time_bucket,
        SUM(da.account_num) OVER (
            ORDER BY time_bucket
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_new_accounts
    FROM distinct_accounts da
),
rolling_median AS (
    SELECT
        outer_bucket.time_bucket AS current_bucket,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY inner_bucket.new_accounts)
            AS rolling_median_accounts
    FROM cumulative_accounts AS outer_bucket
    JOIN cumulative_accounts AS inner_bucket
        ON inner_bucket.time_bucket
           BETWEEN outer_bucket.time_bucket - '${sql(median)}'::interval
               AND outer_bucket.time_bucket
    GROUP BY
        outer_bucket.time_bucket
)
SELECT
    cumulative_sum.time_bucket,
    CAST(cumulative_accounts.new_accounts AS integer) AS new_accounts,
    CAST(cumulative_sum.cumulative_new_accounts AS integer) AS cumulative_new_accounts,
    CAST(rolling_median.rolling_median_accounts AS double precision) AS rolling_median_accounts
FROM cumulative_sum
JOIN rolling_median
    ON cumulative_sum.time_bucket = rolling_median.current_bucket
JOIN cumulative_accounts
	on cumulative_accounts.time_bucket = cumulative_sum.time_bucket
WHERE cumulative_sum.time_bucket <= NOW()
ORDER BY cumulative_sum.time_bucket;
    `;
    } catch (error) {
      await logger.log(`Error in getNanoUniqueAccounts: ${error}`, "ERROR");
      throw error;
    }
  }

  static async getNanoBucketDistribution(
    interval: Interval,
  ): Promise<Array<Record<string, unknown>>> {
    let range = "";
    let bucket = "";
    if (interval === "5m") {
      range = config.propagator.range_5m;
      bucket = "5 minutes";
    } else if (interval === "1h") {
      range = config.propagator.range_1h;
      bucket = "1 hour";
    } else if (interval === "1d") {
      range = config.propagator.range_1d;
      bucket = "1 day";
    }

    try {
      return await sql<Array<Record<string, unknown>>>`
      WITH mapped_balances AS (
        SELECT
            time_bucket('${sql(bucket)}', confirmation_time) + '${
        sql(bucket)
      }'::interval AS time_bucket,
            get_bucket_id(balance::numeric) AS bucket_id
        FROM block_confirmations
        WHERE block_subtype = 'send'
          AND confirmation_type = 'active_quorum'
          AND confirmation_time >= NOW() - '${sql(range)}'::interval
      )
      SELECT
          time_bucket,
          CAST(COUNT(*) FILTER (WHERE bucket_id = 0) AS integer) AS "0",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 1) AS integer) AS "1",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 2) AS integer) AS "2",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 3) AS integer) AS "3",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 4) AS integer) AS "4",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 5) AS integer) AS "5",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 6) AS integer) AS "6",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 7) AS integer) AS "7",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 8) AS integer) AS "8",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 9) AS integer) AS "9",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 10) AS integer) AS "10",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 11) AS integer) AS "11",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 12) AS integer) AS "12",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 13) AS integer) AS "13",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 14) AS integer) AS "14",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 15) AS integer) AS "15",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 16) AS integer) AS "16",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 17) AS integer) AS "17",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 18) AS integer) AS "18",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 19) AS integer) AS "19",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 20) AS integer) AS "20",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 21) AS integer) AS "21",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 22) AS integer) AS "22",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 23) AS integer) AS "23",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 24) AS integer) AS "24",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 25) AS integer) AS "25",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 26) AS integer) AS "26",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 27) AS integer) AS "27",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 28) AS integer) AS "28",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 29) AS integer) AS "29",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 30) AS integer) AS "30",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 31) AS integer) AS "31",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 32) AS integer) AS "32",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 33) AS integer) AS "33",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 34) AS integer) AS "34",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 35) AS integer) AS "35",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 36) AS integer) AS "36",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 37) AS integer) AS "37",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 38) AS integer) AS "38",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 39) AS integer) AS "39",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 40) AS integer) AS "40",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 41) AS integer) AS "41",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 42) AS integer) AS "42",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 43) AS integer) AS "43",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 44) AS integer) AS "44",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 45) AS integer) AS "45",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 46) AS integer) AS "46",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 47) AS integer) AS "47",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 48) AS integer) AS "48",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 49) AS integer) AS "49",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 50) AS integer) AS "50",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 51) AS integer) AS "51",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 52) AS integer) AS "52",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 53) AS integer) AS "53",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 54) AS integer) AS "54",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 55) AS integer) AS "55",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 56) AS integer) AS "56",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 57) AS integer) AS "57",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 58) AS integer) AS "58",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 59) AS integer) AS "59",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 60) AS integer) AS "60",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 61) AS integer) AS "61",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 62) AS integer) AS "62",
          CAST(COUNT(*) FILTER (WHERE bucket_id = 63) AS integer) AS "63"
      FROM mapped_balances
      WHERE time_bucket <= NOW()
      GROUP BY time_bucket
      ORDER BY time_bucket;
    `;
    } catch (error) {
      await logger.log(`Error in getNanoUniqueAccounts: ${error}`, "ERROR");
      throw error;
    }
  }

  static async refreshMaterializedViews(): Promise<void> {
    try {
      // Add your materialized view refresh statements here
      await sql`REFRESH MATERIALIZED VIEW nano_prices_5m_base;`;
      await sql`REFRESH MATERIALIZED VIEW nano_prices_5m;`;
      // Add more view refreshes as needed
    } catch (error) {
      await logger.log(
        `Error refreshing materialized views: ${error}`,
        "ERROR",
      );
      throw error;
    }
  }
}
