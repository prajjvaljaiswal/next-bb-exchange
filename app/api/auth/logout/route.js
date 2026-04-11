import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND = "http://localhost:5000/api/v1";

export async function POST(request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const authHeader = request.headers.get("authorization");

  await fetch(`${BACKEND}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(refreshToken ? { Cookie: `refreshToken=${refreshToken}` } : {}),
    },
  }).catch(() => {});

  const response = NextResponse.json({ success: true, data: { message: "Logged out" } });
  response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
  return response;
}
