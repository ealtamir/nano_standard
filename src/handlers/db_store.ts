import { TopicMessage, NanoMessage } from "../models.ts";
import sql from "../db.ts";

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
                    hash,
                    topic,
                    confirmation_time,
                    confirmation_type,
                    account,
                    amount,
                    block_type,
                    block_subtype,
                    previous_block,
                    representative,
                    balance,
                    link,
                    link_as_account,
                    signature,
                    work
                ) VALUES (
                    ${hash},
                    ${topic},
                    to_timestamp(${parseInt(time) / 1000.0}),
                    ${confirmation_type},
                    ${account},
                    ${amount},
                    ${block.type},
                    ${block.subtype},
                    ${block.previous},
                    ${block.representative},
                    ${block.balance},
                    ${block.link},
                    ${block.link_as_account},
                    ${block.signature},
                    ${block.work}
                )
                ON CONFLICT (hash) DO NOTHING
            `;
        } catch (error) {
            console.error('Error storing confirmation:', error);
            throw error;
        }
    }
}
