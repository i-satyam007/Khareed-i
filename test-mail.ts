import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

async function main() {
    // Dynamic import to ensure env vars are loaded first
    const { sendSignupOTP } = await import('./lib/mail');

    console.log("Testing email sending...");
    // Using a dummy email to trigger the Resend restriction error (or success if verified)
    const email = "random.user.123456@gmail.com";
    const otp = "123456";
    const result = await sendSignupOTP(email, otp);
    console.log("Result:", result);
}

main();
