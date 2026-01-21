
import 'dotenv/config';
import { db } from "../src/db";
import { migrate } from "drizzle-orm/neon-http/migrator";

async function runMigrate() {
    console.log("Running migrations...");
    try {
        await migrate(db, { migrationsFolder: "migrations" });
        console.log("Migrations completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

runMigrate();
