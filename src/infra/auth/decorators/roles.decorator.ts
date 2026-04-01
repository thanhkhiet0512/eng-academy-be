import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "../../../domain/auth/user-role";

export const ROLES_KEY = "roles";

// Attach required roles to a route handler or controller class
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
