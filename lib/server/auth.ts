import type { Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { ApiError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export const requireAuth = async (request: NextRequest): Promise<AuthUser> => {
  const session = await auth();
  const sessionUser = session?.user as { id?: string; email?: string | null; role?: Role } | undefined;
  let user = null as { id: string; email: string; role: Role } | null;

  if (sessionUser?.id) {
    user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, email: true, role: true },
    });
  } else if (sessionUser?.email) {
    user = await prisma.user.findUnique({
      where: { email: sessionUser.email },
      select: { id: true, email: true, role: true },
    });
  }

  if (!user) {
    const headerUserId = request.headers.get("x-user-id");
    if (!headerUserId) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required.");
    }

    user = await prisma.user.findUnique({
      where: { id: headerUserId },
      select: { id: true, email: true, role: true },
    });
  }

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "User session is invalid.");
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
};

export const requireRole = async (request: NextRequest, roles: Role[]): Promise<AuthUser> => {
  const user = await requireAuth(request);
  if (!roles.includes(user.role)) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this resource.");
  }

  return user;
};
