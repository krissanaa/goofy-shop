import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((request) => {
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    const authUser = request.auth?.user as { id?: string; role?: string } | undefined;
    const headerUserId = request.headers.get("x-user-id");
    const headerRole = request.headers.get("x-user-role");
    const role = authUser?.role ?? headerRole;

    if (!authUser?.id && !headerUserId) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required.",
          },
        },
        { status: 401 },
      );
    }

    if (role !== "ADMIN" && role !== "STAFF") {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Insufficient role.",
          },
        },
        { status: 403 },
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/api/admin/:path*"],
};
