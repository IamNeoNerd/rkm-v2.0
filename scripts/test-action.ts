
import 'dotenv/config';
import { processAdmission } from "../src/actions/admission";

async function testAdmission() {
    console.log("Testing processAdmission...");
    const data = {
        fatherName: "Script Parent",
        phone: "9998881111",
        studentName: "Script Student",
        studentClass: "Class 10",
        monthlyFee: 3000,
        joiningDate: new Date("2026-01-20"),
        initialPayment: 1161
    };

    const result = await processAdmission(data);
    console.log("Result:", result);
}

testAdmission();
