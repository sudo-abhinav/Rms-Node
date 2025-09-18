    import 'dotenv/config';
    import { defineConfig } from 'drizzle-kit';
    import dotenv from "dotenv"

    dotenv.config()

   type DbConfig  = {
  host  :string;
  database : string;
  user : string;
  password :string;
  port : number;
  ssl : boolean
}


const dbCreds: DbConfig = {
  host: process.env.DB_HOST || '',         // Required, with fallback
  database: process.env.DB_DATABASE || 'rms', // Required, with fallback
  user: process.env.DB_USER || '',         // Optional, with fallback
  password: process.env.DB_PASSWORD || '', // Optional, with fallback
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5436,
  ssl: process.env.DB_SSL === 'true',      // Ensure boolean
};
console.log(dbCreds)
if (!process.env.DB_HOST || !process.env.DB_DATABASE) {
  throw new Error('Environment variables DB_HOST and DB_DATABASE are required');
}

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema',
  dialect: 'postgresql',
  dbCredentials:dbCreds
});