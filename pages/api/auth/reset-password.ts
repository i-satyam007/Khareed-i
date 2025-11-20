// pages/api/auth/reset-password.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { hashPwd, comparePwd } from "../../../lib/hash"; // Ensure comparePwd is imported

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ error: "Missing fields" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.resetOTP || !user.resetOTPExpiry) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Check OTP match
    if (user.resetOTP !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check expiry
    if (new Date() > user.resetOTPExpiry) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // ✅ NEW: Check if new password is same as old
    const isSame = await comparePwd(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ error: "New password cannot be the same as the old password" });
    }

    // Hash new password and clear OTP
    const hashedPassword = await hashPwd(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetOTP: null,
        resetOTPExpiry: null
      }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}