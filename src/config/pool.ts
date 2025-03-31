import { Pool, QueryResult, PoolClient } from 'pg';

export interface PoolOptions {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

class DatabasePool {
  private _pool: Pool | null = null;

  async connect(options: PoolOptions): Promise<QueryResult | void> {
    try {
      this._pool = new Pool(options);
      // Check the connection by querying a basic SELECT statement
      return await this._pool.query('SELECT 1 + 1;');
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Handle the error type safely
        console.error(`Error connecting to the database: ${error.message}`);
        throw error; // Optionally rethrow the error if needed
      }
      throw new Error(
        'Unknown error occurred while connecting to the database',
      );
    }
  }

  // Close the pool connection
  async close(): Promise<void> {
    if (this._pool) {
      return await this._pool.end();
    }
    return Promise.reject(
      new Error('Unknown error occurred while close pool connection'),
    );
  }

  // Query the pool
  async query(sql: string, params?: any[]): Promise<QueryResult> {
    if (this._pool) {
      return await this._pool?.query(sql, params);
    }
    return Promise.reject(new Error('Error in query pool'));
  }

  // Get a dedicated client for transactions
  async getClient(): Promise<PoolClient> {
    if (!this._pool) {
      throw new Error('Pool is not connected');
    }
    const client = await this._pool.connect(); // Get client connection
    return client;
  }
}

export default new DatabasePool();
