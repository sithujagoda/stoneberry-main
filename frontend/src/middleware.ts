import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isComplete = token?.is_complete;
    const path = req.nextUrl.pathname;

    // 1. If user is logged in but incomplete, force redirect to /onboarding
    if (isAuth && !isComplete && path !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // 2. If user is logged in, complete, and tries to visit onboarding, redirect to home
    if (isAuth && isComplete && path === "/onboarding") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Allow other routes to pass through
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Define routes that do NOT require authentication at all
        const isPublicPath =
          path === "/" ||
          path.startsWith("/api/") ||
          path.startsWith("/_next/") ||
          path.startsWith("/images/") ||
          path.startsWith("/favicon.ico") ||
          path === "/login" ||
          path === "/register" ||
          path === "/gems" ||
          /^\/gems\/[^/]+$/.test(path); // View individual gem details is public

        if (isPublicPath) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: [
    // Apply middleware to all routes except assets and system folders
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
