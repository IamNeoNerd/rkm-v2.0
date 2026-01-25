
import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function checkSchema() {
    try {
        const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'students'
    `);
        console.log('Columns in students table:', result.rows);

        const transactionsResult = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transactions'
    `);
        console.log('Columns in transactions table:', transactionsResult.rows);

    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        process.exit();
    }
}

checkSchema();
