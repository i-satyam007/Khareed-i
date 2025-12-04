import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { sendSignupOTP } from "../../../lib/mail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
        // Check if email already exists in User table
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Store in VerificationCode table (upsert to handle retries)
        await prisma.verificationCode.upsert({
            where: { email },
            update: { code: otp, expiresAt },
            create: { email, code: otp, expiresAt }
        });

        // Send email
        const sent = await sendSignupOTP(email, otp);
        if (!sent) {
            return res.status(500).json({ error: "Failed to send email" });
        }

        return res.json({ success: true });
    } catch (error) {
        console.error("OTP Error:", error);
        return res.status(500).json({ error: "Server error" });
    }
}
