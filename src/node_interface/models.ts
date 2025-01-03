/**
 * Represents a Nano block in the state block format
 */
interface NanoBlock {
  /** Block type, always "state" for newer blocks */
  type: string;

  /** The account's nano_ address (32 bytes) */
  account: string;

  /**
   * Hash of the previous block in this account's chain (32 bytes)
   * Will be 0 if this is the first block (open block)
   * Format: 64 character hex string
   */
  previous: string;

  /**
   * The representative nano_ address for this account (32 bytes)
   * Used for consensus voting power delegation
   */
  representative: string;

  /**
   * The resulting account balance after this transaction (in raw units)
   * Format: decimal string (16 bytes)
   * Note: 1 Nano = 10^30 raw
   */
  balance: string;

  /**
   * Multipurpose field (32 bytes) that varies based on block subtype:
   * - For "send": Destination account's public key (64 hex chars)
   * - For "receive": Hash of the corresponding send block (64 hex chars)
   * - For "change": Must be "0"
   */
  link: string;

  /**
   * The link field interpreted as a nano_ address
   * Relevant for send blocks where link contains a public key
   */
  link_as_account: string;

  /**
   * ED25519+Blake2b 512-bit signature of the block
   * Format: 128 character hex string (64 bytes)
   */
  signature: string;

  /**
   * Proof of Work nonce
   * Format: 16 character hex string (8 bytes)
   */
  work: string;

  /**
   * The type of transaction:
   * - "send": Sending funds to another account
   * - "receive": Receiving funds from another account
   * - "change": Changing the representative
   */
  subtype: string;
}

/**
 * Represents a message containing transaction details
 */
export interface NanoMessage {
  /** The nano_ address of the account involved in the transaction */
  account: string;

  /**
   * The transaction amount in raw units
   * Format: decimal string
   */
  amount: string;

  /**
   * The unique hash identifier for this block
   * Format: 64 character hex string
   */
  hash: string;

  /**
   * The type of confirmation:
   * - "active_quorum": Confirmed through active voting
   * - Other values possible based on consensus type
   */
  confirmation_type: string;

  /** The full block details */
  block: NanoBlock;
}

/**
 * Represents a complete confirmation message from the Nano network
 */
export interface TopicMessage<T> {
  /** Message topic, typically "confirmation" */
  topic: string;

  /**
   * Unix timestamp of the confirmation
   * Format: milliseconds since epoch as string
   */
  time: string;

  /** The detailed message content */
  message: T;
}

export interface NanoVolumeData {
  time_bucket: string;
  amount_nano: number;
  rolling_median: number;
  gini_coefficient: number;
}

export interface NanoPriceData {
  time_bucket: string;
  currency: string;
  price: number;
  value_transmitted_in_currency: number;
  rolling_median: number;
}

export interface NanoConfirmationData {
  time_bucket: string;
  current_confirmations: number;
  rolling_median: number;
  cumulative_sum_confirmations: number;
}

export interface NanoUniqueAccountsData {
  time_bucket: string;
  new_accounts: number;
  rolling_median_accounts: number;
  cumulative_new_accounts: number;
}
