
import 'dotenv/config';
import { db } from "../src/db";
import { families, students, transactions } from "../src/db/schema";

async function checkData() {
    console.log("Checking DB Content...");
    const allFamilies = await db.select().from(families);
    console.log(`Families found: ${allFamilies.length}`);
    allFamilies.forEach(f => console.log(`- ${f.fatherName} (${f.phone}) Balance: ${f.balance}`));

    const allStudents = await db.select().from(students);
    console.log(`\nStudents found: ${allStudents.length}`);
    allStudents.forEach(s => console.log(`- ${s.name} (Class ${s.class}) Active: ${s.isActive}`));

    const allTxs = await db.select().from(transactions);
    console.log(`\nTransactions found: ${allTxs.length}`);
    allTxs.forEach(t => console.log(`- ${t.type} ${t.amount} (${t.description})`));
}

checkData();
