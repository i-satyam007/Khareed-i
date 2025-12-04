import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { sendOTP } from "../../../lib/mail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("Forgot Password: User not found for email:", email);
      // Security: Don't reveal user doesn't exist, just fake success
      return res.json({ success: true });
    }
    console.log("Forgot Password: User found:", user.email);

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

    console.log("Forgot Password: Updating user with OTP...");
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetOTP: otp, resetOTPExpiry: expiry }
      });
      console.log("Forgot Password: User updated successfully.");
    } catch (dbError) {
      console.error("Forgot Password: DB Update Failed:", dbError);
      return res.status(500).json({ error: "Database error" });
    }

    console.log("Forgot Password: Sending email to", email);
    const sent = await sendOTP(email, otp);
    console.log("Forgot Password: Email send result:", sent);

    if (!sent) {
      console.error("Failed to send password reset OTP to", email);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}