
import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            process.env[key.trim()] = value.replace(/^["']|["']$/g, ''); // Remove quotes if present
        }
    });
}

import { sendOTP } from "./lib/mail";

async function test() {
    console.log("Testing sendOTP...");
    const email = "test-user@khareed-i.shop"; // Or any valid email
    const otp = "123456";

    console.log(`Sending OTP to ${email}...`);
    const success = await sendOTP(email, otp);

    if (success) {
        console.log("✅ Email sent successfully!");
    } else {
        console.error("❌ Failed to send email.");
    }
}

test();
