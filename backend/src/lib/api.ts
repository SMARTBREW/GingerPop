import { Response } from "express";

function noStore(res: Response) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
}

export function jsonOk<T>(res: Response, data: T, status = 200) {
  noStore(res);
  return res.status(status).json(data);
}

export function jsonError(res: Response, message: string, status = 400) {
  noStore(res);
  return res.status(status).json({ error: message });
}

export function unauthorized(res: Response) {
  return jsonError(res, "Unauthorized", 401);
}

export function getAppUrl() {
  return (
    process.env.FRONTEND_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}
