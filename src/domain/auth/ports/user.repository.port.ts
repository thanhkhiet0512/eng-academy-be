import type { AuthUser } from "../entities/auth-user.entity";
import type { UserRole } from "../user-role";

// Teacher preference fields stored on the user record
export type TeacherPreferences = {
  lastWorkingClassId: string | null;
  myClassesDetailClassId: string | null;
};

export abstract class UserRepositoryPort {
  abstract findByEmail(email: string): Promise<AuthUser | null>;
  abstract findById(id: string): Promise<AuthUser | null>;
  abstract create(input: {
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
  }): Promise<AuthUser>;
  abstract updateProfile(userId: string, patch: { name?: string; passwordHash?: string }): Promise<AuthUser>;
  abstract findTeacherPreferences(userId: string): Promise<TeacherPreferences | null>;
  abstract updateTeacherPreferences(
    userId: string,
    patch: Partial<TeacherPreferences>,
  ): Promise<void>;
}
