import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

export const migration = async () => {
  await new Promise((resolve) => setTimeout(resolve, 15000));

  await migrate(drizzle(pool), {
    migrationsFolder: "src/database/migrations",
  });

  await pool.end();
};
