import dotenv from 'dotenv';
import { Pool } from "pg";
import { postgresConnectionString } from '@vercel/postgres';

dotenv.config();

export function ConnectDb() {
    const pool = new Pool({
        user: process.env.PGSQL_USER,
        host: process.env.PGSQL_HOST,
        database: process.env.PGSQL_DATABASE,
        password: process.env.PGSQL_PASSWORD,
        port: 5432
    });
    return pool;
}