import { env } from "@/lib/env";

export function isAdmin(request: Request): boolean {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice("Bearer ".length) === env.adminSecret;
}
