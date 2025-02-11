CREATE TABLE importance_scores (
    -- Primary identifiers
    group_id VARCHAR(255) NOT NULL,
    group_timestamp VARCHAR(255) NOT NULL,
    account VARCHAR(255) NOT NULL,
    local_timestamp BIGINT NOT NULL,

    -- Score components
    balance_score FLOAT NOT NULL,
    activity_score FLOAT NOT NULL,
    peers_score FLOAT NOT NULL,
    volume_score FLOAT NOT NULL,
    recency_score FLOAT NOT NULL,
    longevity_score FLOAT NOT NULL,
    total_sent_score FLOAT NOT NULL,
    total_received_score FLOAT NOT NULL,
    transaction_frequency_score FLOAT NOT NULL,

    -- Network analysis metrics
    betweenness_centrality_score FLOAT NOT NULL,
    page_rank_centrality_score FLOAT NOT NULL,
    cluster_label VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Primary key
    PRIMARY KEY (group_id, account)
);

-- Create indexes separately
CREATE INDEX idx_group_id ON importance_scores (group_id);
CREATE INDEX idx_account ON importance_scores (account);
CREATE INDEX idx_group_timestamp ON importance_scores (group_timestamp);

CREATE TABLE graph_data (
    -- Primary identifiers
    group_id VARCHAR(255) NOT NULL,
    group_timestamp VARCHAR(255) NOT NULL,

    nodes_qty INTEGER NOT NULL,
    edges_qty INTEGER NOT NULL,
    

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Graph data
    graph_json TEXT NOT NULL,

    -- Primary key
    PRIMARY KEY (group_id, group_timestamp)
);

CREATE TABLE accounts_equality_status (
    -- Primary identifiers
    calculation_id VARCHAR(255) NOT NULL,
    calculation_timestamp VARCHAR(255) NOT NULL,

    -- Inequality metrics
    gini_coefficient FLOAT NOT NULL,
    js_divergence FLOAT NOT NULL,
    wasserstein_distance FLOAT NOT NULL,

    -- Array data stored as JSON
    percentile_distribution JSONB NOT NULL,
    flows_matrix JSONB NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Primary key
    PRIMARY KEY (calculation_id)
);

-- Create index separately
CREATE INDEX idx_calculation_timestamp ON accounts_equality_status (calculation_timestamp);