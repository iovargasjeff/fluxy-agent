import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const globalForDb = globalThis as unknown as { connection: postgres.Sql };
const connection = globalForDb.connection ?? postgres(process.env.DATABASE_URL!, { prepare: false });

if (process.env.NODE_ENV !== 'production') globalForDb.connection = connection;

export const db = drizzle(connection, { schema });
