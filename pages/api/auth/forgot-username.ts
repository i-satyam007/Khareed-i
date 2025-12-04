// pages/api/auth/forgot-username.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { sendUsername } from "../../../lib/mail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("Forgot Username: User not found for email:", email);
      return res.status(404).json({ success: false, error: "Email not found linked with any account" });
    }
    console.log("Forgot Username: User found:", user.email);

    console.log("Forgot Username: Sending email to", email);
    const sent = await sendUsername(email, user.username);
    console.log("Forgot Username: Email send result:", sent);

    if (!sent) {
      console.error("Failed to send username to", email);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.json({ success: true, message: "An email has been sent to your email address" });
  } catch (error) {
    console.error("Forgot Username Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}