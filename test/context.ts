import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { randomBytes } from 'crypto';
import { default as migrate } from 'node-pg-migrate';
import * as format from 'pg-format';
import pool from '../src/config/pool';
import { PoolOptions } from '../src/config/pool';
dotenv.config({ path: '.env' }); // Load environment variables

// Default connection settings
const DEFAULT_OPTS: PoolOptions = {
  host: process.env.DB_HOST ?? '',
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME ?? '',
  user: process.env.DB_USER ?? '',
  password: process.env.DB_PASSWORD ?? '',
};

@Injectable()
export class TestContext {
  private roleName: string;
  constructor(roleName: string) {
    this.roleName = roleName;
  }

  // Builds the test context
  static async build(): Promise<TestContext> {
    // Generate random role name to connect to the pg
    const roleName = 'test_' + randomBytes(4).toString('hex');
    // Connect to PG
    await pool.connect(DEFAULT_OPTS);

    // Create the schema tied to the test role
    await pool.query(
      format('CREATE ROLE %I WITH LOGIN PASSWORD %L', roleName, roleName),
    );

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
      migrationsTable: 'migrations', // Add the migrationsTable property
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
