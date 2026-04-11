import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND = "http://localhost:5000/api/v1";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_REFRESH_TOKEN", message: "No refresh token" } },
      { status: 401 }
    );
  }

  const backendRes = await fetch(`${BACKEND}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `refreshToken=${refreshToken}`,
    },
  });

  const data = await backendRes.json();

  if (!data.success) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  // Extract the new refreshToken from the backend Set-Cookie header
  const setCookie = backendRes.headers.get("set-cookie");
  const newToken = setCookie?.match(/refreshToken=([^;]+)/)?.[1];

  const response = NextResponse.json(data);

  if (newToken) {
    response.cookies.set("refreshToken", newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
  }

  return response;
}
