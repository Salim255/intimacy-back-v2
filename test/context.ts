import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { default as migrate } from 'node-pg-migrate';
import * as format from 'pg-format';
import pool from '../src/config/pool';
import { PoolOptions } from '../src/config/pool';

// Default connection settings
const DEFAULT_OPTS: PoolOptions = {
  host: process.env.DB_TEST_HOST ?? '',
  port: Number(process.env.DB_TEST_PORT),
  database: process.env.DB_TEST_DATABASE ?? '',
  user: process.env.DB_TEST_USER ?? '',
  password: process.env.DB_TEST_PASSWORD ?? '',
};

@Injectable()
export class TestContext {
  private roleName: string;
  private connectionString: string;
  constructor(roleName: string) {
    this.roleName = roleName;
    this.connectionString = `postgresql://${roleName}:${roleName}@${DEFAULT_OPTS.host}:${DEFAULT_OPTS.port}/${DEFAULT_OPTS.database}`;
  }

  // Builds the test context
  static async build(): Promise<TestContext> {
    try {
      // Generate random role name to connect to the pg
      const roleName = 'test_' + randomBytes(4).toString('hex');

      // Connect to PG
      await pool.connect(DEFAULT_OPTS);

      // Create the role
      await pool.query(
        format('CREATE ROLE %I WITH LOGIN PASSWORD %L', roleName, roleName),
      );

      // Create schema for test role
      await pool.query(
        format('CREATE SCHEMA %I AUTHORIZATION %I;', roleName, roleName),
      );
      /* 
      // Inject ENUM creation inside the new schema
      await pool.query(
        format(
          `
        SET search_path TO %I;

        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
            CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interested_in_enum') THEN
            CREATE TYPE interested_in_enum AS ENUM ('men', 'women', 'both');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'looking_for_enum') THEN
            CREATE TYPE looking_for_enum AS ENUM ('chat', 'friendship', 'casual', 'long_term');
          END IF;
        END$$;
      `,
          roleName,
        ),
      ); */
      // Close the initial pool
      // or Disconnect from PG
      await pool.close();

      // Run migrations on the new schema
      await migrate({
        schema: roleName,
        direction: 'up',
        log: () => {},
        noLock: true,
        dir: 'migrations',
        databaseUrl: {
          host: DEFAULT_OPTS.host,
          port: DEFAULT_OPTS.port,
          database: DEFAULT_OPTS.database,
          user: roleName,
          password: roleName,
        },
        migrationsTable: 'migrations', // The migrationsTable property
      });

      // Connect again with the new role and schema
      const SCHEMA_OPTS = {
        host: DEFAULT_OPTS.host,
        port: DEFAULT_OPTS.port,
        database: DEFAULT_OPTS.database,
        user: roleName,
        password: roleName,
      };
      await pool.connect(SCHEMA_OPTS);

      return new TestContext(roleName);
    } catch (error) {
      throw new Error(`Something wrong: ${error}`);
    }
  }
  getConnectionString(): string {
    return this.connectionString;
  }

  async close(): Promise<void> {
    await pool.close();

    // Reconnect as root user for cleanup
    await pool.connect(DEFAULT_OPTS);

    // Drop the schema and the role
    await pool.query(format('DROP SCHEMA %I CASCADE;', this.roleName));
    await pool.query(format('DROP ROLE %I;', this.roleName));
    // Disconnect
    await pool.close();
  }
}
