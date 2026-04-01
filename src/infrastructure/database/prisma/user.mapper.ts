import { UserRole as PrismaUserRole } from "@prisma/client";
import type { AuthUser } from "../../../domain/auth/entities/auth-user.entity";
import type { UserRole } from "../../../domain/auth/user-role";

export type UserRow = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: PrismaUserRole;
  createdAt: Date;
  updatedAt: Date;
};

export function toDomainRole(role: PrismaUserRole): UserRole {
  switch (role) {
    case "TEACHER":
      return "TEACHER";
    case "STUDENT":
      return "STUDENT";
    case "PARENT":
      return "PARENT";
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

export function toPrismaRole(role: UserRole): PrismaUserRole {
  return role as PrismaUserRole;
}

export function mapUserRowToDomain(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: toDomainRole(row.role),
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
