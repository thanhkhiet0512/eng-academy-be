import type { UserRole } from "../../../domain/auth/user-role";

/** Gắn vào `req.user` sau JWT validate (không chứa password). */
export type RequestUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};
