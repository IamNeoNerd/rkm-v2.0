/**
 * Create User Accounts for Existing Staff Members
 * 
 * This script:
 * 1. Reads all active staff from the database
 * 2. Creates corresponding user accounts using phone as identifier
 * 3. Sets default password (phone number) - can be changed by admin
 * 4. Links role from staff table to user table
 */

import "dotenv/config";
import { db } from "../src/db";
import { users, staff } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const log = (msg: string) => console.log(`[CREATE-USERS] ${msg}`);
const success = (msg: string) => console.log(`[✅] ${msg}`);
const warn = (msg: string) => console.log(`[⚠️] ${msg}`);

async function main() {
    log("🚀 Creating user accounts for staff members...");

    try {
        // Fetch all staff members
        const allStaff = await db.query.staff.findMany({
            where: eq(staff.isActive, true)
        });

        if (allStaff.length === 0) {
            warn("No staff members found. Please run the seed script first.");
            process.exit(0);
        }

        log(`Found ${allStaff.length} active staff members.`);

        let created = 0;
        let skipped = 0;

        for (const staffMember of allStaff) {
            // Check if user already exists with this phone
            const existingUser = await db.query.users.findFirst({
                where: eq(users.phone, staffMember.phone)
            });

            if (existingUser) {
                log(`Skipping ${staffMember.name} - User already exists`);
                skipped++;
                continue;
            }

            // Default password is the phone number (can be changed by admin)
            const defaultPassword = staffMember.phone;
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            // Map staff role to user role
            let userRole = "user";
            if (staffMember.role === "ADMIN") {
                userRole = "admin";
            } else if (staffMember.role === "TEACHER") {
                userRole = "teacher";
            } else if (staffMember.role === "RECEPTIONIST") {
                userRole = "cashier"; // Receptionists get cashier portal access
            } else {
                userRole = "staff"; // Other staff types
            }

            // Create user account
            await db.insert(users).values({
                id: crypto.randomUUID(),
                name: staffMember.name,
                email: staffMember.email || `${staffMember.phone}@rkinstitute.com`, // Generate email if not present
                phone: staffMember.phone,
                password: hashedPassword,
                role: userRole,
                isVerified: true, // Auto-verify staff accounts
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            success(`Created user account for: ${staffMember.name} (${userRole})`);
            log(`  → Phone: ${staffMember.phone}`);
            log(`  → Default Password: ${defaultPassword} (same as phone)`);
            created++;
        }

        success(`\n✨ User Account Creation Complete!`);
        console.log(`\nSummary:`);
        console.log(`  ✅ Created: ${created} accounts`);
        console.log(`  ⏭️  Skipped: ${skipped} (already exist)`);
        console.log(`\n📝 Login Instructions:`);
        console.log(`  • Phone Number: Use the staff member's phone as identifier`);
        console.log(`  • Password: Initially set to phone number (e.g., 9000000011)`);
        console.log(`  • Change passwords via Staff Management module (admin portal)`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating user accounts:", error);
        process.exit(1);
    }
}

main();
