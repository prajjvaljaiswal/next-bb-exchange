import { NextResponse } from "next/server";

const BACKEND = "http://localhost:5000/api/v1";

export async function POST(request) {
  const body = await request.json();

  const backendRes = await fetch(`${BACKEND}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!data.success) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  // Extract refreshToken from backend Set-Cookie and set it as same-origin cookie
  const setCookie = backendRes.headers.get("set-cookie");
  const refreshToken = setCookie?.match(/refreshToken=([^;]+)/)?.[1];

  const response = NextResponse.json(data);

  if (refreshToken) {
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
  }

  return response;
}
