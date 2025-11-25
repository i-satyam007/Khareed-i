import { verifyToken } from "./jwt";
import { prisma } from "./prisma";

export async function getUser(req: any) {
  const cookie = req.headers.cookie || "";


  // Use regex to find the token cookie safely
  const match = cookie.match(/token=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) return null;

  try {
    const payload: any = verifyToken(token);
    if (!payload?.userId) return null;

    return await prisma.user.findUnique({ where: { id: payload.userId } });
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
