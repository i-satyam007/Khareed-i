// pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getUser } from "../../../lib/getUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUser(req);

  if (!user) return res.status(200).json({ user: null });
  // return a safe subset
  return res.json({ user: { id: user.id, name: user.name, email: user.email, username: user.username, role: user.role } });
}
