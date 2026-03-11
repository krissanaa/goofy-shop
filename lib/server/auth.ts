import { NextRequest } from "next/server";
import { ApiError } from "@/lib/server/errors";
import { supabase } from "@/lib/supabase";

export type Role = "CUSTOMER" | "STAFF" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export const requireAuth = async (request: NextRequest): Promise<AuthUser> => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required.");
  }

  return {
    id: user.id,
    email: user.email!,
    role: (user.user_metadata?.role as Role) || "CUSTOMER",
  };
};

export const requireRole = async (request: NextRequest, roles: Role[]): Promise<AuthUser> => {
  const user = await requireAuth(request);
  if (!roles.includes(user.role)) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this resource.");
  }

  return user;
};
