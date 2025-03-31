/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.sql(
    `CREATE TABLE users (
        id SERIAL PRIMARY KEY,
    
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
        first_name VARCHAR(30),
    
        last_name VARCHAR(30),
    
        avatar VARCHAR(250),
    
        email VARCHAR(50) NOT NULL UNIQUE,
    
        password VARCHAR NOT NULL,
    
        is_staff BOOLEAN DEFAULT FALSE,
    
        is_active BOOLEAN DEFAULT TRUE,
    
        connection_status VARCHAR(50) NOT NULL DEFAULT 'offline' CHECK (connection_status IN ('offline', 'online', 'away'))
    )`,
  );
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.sql(`DROP TABLE users;`);
};
