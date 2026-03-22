import { Injectable } from "@nestjs/common";
import { UserRole as PrismaUserRole } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import type { AuthUser } from "../../../domain/auth/entities/auth-user.entity";
import type { UserRole } from "../../../domain/auth/user-role";
import { UserRepositoryPort } from "../../../domain/auth/ports/user.repository.port";

function toDomainRole(r: PrismaUserRole): UserRole {
  switch (r) {
    case "TEACHER":
      return "TEACHER";
    case "STUDENT":
      return "STUDENT";
    case "PARENT":
      return "PARENT";
    default: {
      const _exhaustive: never = r;
      return _exhaustive;
    }
  }
}

function toPrismaRole(r: UserRole): PrismaUserRole {
  return r as PrismaUserRole;
}

@Injectable()
export class UserRepositoryAdapter extends UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const row = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    return row ? this.map(row) : null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async create(input: {
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
  }): Promise<AuthUser> {
    const row = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.name,
        role: toPrismaRole(input.role),
      },
    });
    return this.map(row);
  }

  private map(row: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: PrismaUserRole;
    createdAt: Date;
    updatedAt: Date;
  }): AuthUser {
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
}
