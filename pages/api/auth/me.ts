// pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getUser } from "../../../lib/getUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Prevent caching
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const user = await getUser(req);

  if (!user) return res.status(200).json({ user: null });

  // Return all necessary profile fields
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      hostel: user.hostel,
      phone: user.phone,
      avatar: user.avatar,
      blacklistUntil: user.blacklistUntil
    }
  });
}
