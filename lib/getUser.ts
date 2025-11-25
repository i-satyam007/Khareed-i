import { verifyToken } from "./jwt";
import { prisma } from "./prisma";

export async function getUser(req: any) {
  // Try to get token from Next.js parsed cookies first
  let token = req.cookies?.token;

  // Fallback to regex if req.cookies is missing (e.g. raw request)
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/token=([^;]+)/);
    token = match ? match[1] : null;
  }

  if (!token) {
    console.log("getUser: No token found in cookies or header");
    return null;
  }

  try {
    const payload: any = verifyToken(token);
    if (!payload?.userId) {
      console.log("getUser: Invalid payload or missing userId", payload);
      return null;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) console.log("getUser: User not found in DB for ID:", payload.userId);
    return user;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
