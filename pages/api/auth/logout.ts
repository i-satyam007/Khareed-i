export default function handler(req: any, res: any) {
  console.log("Logout requested. Cookies:", req.cookies);
  const isProduction = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `token=deleted; HttpOnly; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${isProduction ? "; Secure" : ""}`
  );
  return res.json({ success: true });
}
