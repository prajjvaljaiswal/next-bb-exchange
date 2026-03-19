import { NextResponse } from "next/server";

// Routes that don't require auth
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/reset-password",
  "/forgot-password",
];

// Role -> default redirect after login
const ROLE_DEFAULT_PATHS = {
  PLATFORM_ADMIN: "/platform-admin/dashboard",
  BLOOD_BANK_ADMIN: "/blood-bank/dashboard",
  DONOR: "/donor/dashboard",
  PATIENT: "/patient/dashboard",
};

// Path prefix -> required role
const PROTECTED_PREFIXES = [
  { prefix: "/platform-admin", role: "PLATFORM_ADMIN" },
  { prefix: "/blood-bank", role: "BLOOD_BANK_ADMIN" },
  { prefix: "/donor", role: "DONOR" },
  { prefix: "/patient", role: "PATIENT" },
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Read role from cookie (set by auth service on login)
  const roleCookie = request.cookies.get("userRole")?.value;
  const hasSession = request.cookies.get("refreshToken")?.value;

  // Not logged in — redirect to login
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  for (const { prefix, role } of PROTECTED_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      if (roleCookie !== role) {
        // Redirect to the correct dashboard for their role
        const redirectPath = ROLE_DEFAULT_PATHS[roleCookie] || "/login";
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
