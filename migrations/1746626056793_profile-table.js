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
    // First create enums safely with DO blocks
    pgm.sql(`
    CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');
    CREATE TYPE interested_in_enum AS ENUM ('men', 'women', 'both');
    CREATE TYPE looking_for_enum AS ENUM ('chat', 'friendship', 'casual', 'long_term');
    CREATE TYPE sexual_orientation_enum AS ENUM (
      'straight',
      'heterosexual',
      'gay',
      'lesbian',
      'bisexual',
      'asexual',
      'pansexual',
      'queer',
      'questioning',
      'demisexual'
    );

    `);

    pgm.sql(`
        CREATE TABLE profiles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,  -- Foreign key to the users table
          name VARCHAR(100) NOT NULL,
          birth_date DATE NOT NULL,
          gender gender_enum NOT NULL,
          country VARCHAR(100) NOT NULL,
          city VARCHAR(100) NOT NULL,
          latitude DOUBLE PRECISION,
          longitude DOUBLE PRECISION,
          bio TEXT,
          education VARCHAR(100),
          height DOUBLE PRECISION,
          children BOOLEAN DEFAULT FALSE,
          interested_in interested_in_enum NOT NULL,
          looking_for looking_for_enum[] DEFAULT NULL,
          sexual_orientation sexual_orientation_enum DEFAULT null,
          min_age INTEGER NOT NULL DEFAULT 18,    -- Added min_age with default
          max_age INTEGER NOT NULL DEFAULT 100,   -- Added max_age with default
          max_distance_km INTEGER NOT NULL DEFAULT 40075,
          photos TEXT[] NOT NULL DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql(`DROP TABLE profiles;`);
};
