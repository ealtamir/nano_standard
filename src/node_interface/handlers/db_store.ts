import { TopicMessage, NanoMessage } from "../models.ts";
import { sql } from "../../db.ts";

export class DbStore {
    constructor() {}

    /**
     * Stores a block confirmation in the database
     */
    async storeConfirmation(message: TopicMessage<NanoMessage>) {
        const { topic, time, message: confirmation } = message;
        const { block, hash, confirmation_type, account, amount } = confirmation;

        try {
            await sql`
                INSERT INTO block_confirmations (
                    confirmation_time,
                    confirmation_type,
                    account,
                    amount,
                    block_subtype,
                    representative,
                    balance,
                    link_as_account
                ) VALUES (
                    to_timestamp(${parseInt(time) / 1000.0}),
                    ${confirmation_type},
                    ${account},
                    ${amount},
                    ${block.subtype},
                    ${block.representative},
                    ${block.balance},
                    ${block.link_as_account}
                )
                ON CONFLICT (id, confirmation_time) DO NOTHING
            `;
        } catch (error) {
            console.error('Error storing confirmation:', error);
            throw error;
        }
    }
}
