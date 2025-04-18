/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE session_keys (
        id SERIAL PRIMARY KEY,

        chat_id INT NOT NULL,

        sender_id INT NOT NULL, 

        receiver_id INT NOT NULL, 

        encrypted_session_for_sender TEXT NOT NULL, 

        encrypted_session_for_receiver TEXT NOT NULL, 

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 

        -- Foreign Key Only for chat_id (this is necessary)
        CONSTRAINT fk_chat FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );`);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql(`DROP TABLE session_keys;`);
};
