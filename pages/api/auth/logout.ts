export default function handler(req: any, res: any) {
  res.setHeader("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  return res.json({ success: true });
}
