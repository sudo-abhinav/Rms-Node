    // drizzle.config.js
    import 'dotenv/config';
    import { defineConfig } from 'drizzle-kit';

    export default defineConfig({
      out: './drizzle', // Directory for migrations
      schema: './src/db/schema', // Path to your Drizzle schema definitions
      dialect: 'postgresql', // or 'mysql'
      dbCredentials: {
        // url: process.env.DATABASE_URL,
        host:"127.0.0.1",
        password:"rmspwd",
        port:5436,
        user:"rms",
        database:"rms",
        ssl: false
      },
    });

