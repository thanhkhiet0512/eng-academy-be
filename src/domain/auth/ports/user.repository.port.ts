import type { AuthUser } from "../entities/auth-user.entity";
import type { UserRole } from "../user-role";

export abstract class UserRepositoryPort {
  abstract findByEmail(email: string): Promise<AuthUser | null>;
  abstract findById(id: string): Promise<AuthUser | null>;
  abstract create(input: {
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
  }): Promise<AuthUser>;
}
