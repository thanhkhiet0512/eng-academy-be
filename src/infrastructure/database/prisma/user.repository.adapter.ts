import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import type { AuthUser } from "../../../domain/auth/entities/auth-user.entity";
import type { UserRole } from "../../../domain/auth/user-role";
import { UserRepositoryPort, type TeacherPreferences } from "../../../domain/auth/ports/user.repository.port";
import { mapUserRowToDomain, toPrismaRole } from "./user.mapper";

@Injectable()
export class UserRepositoryAdapter extends UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const row = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    return row ? mapUserRowToDomain(row) : null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? mapUserRowToDomain(row) : null;
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
    return mapUserRowToDomain(row);
  }

  async updateProfile(userId: string, patch: { name?: string; passwordHash?: string }): Promise<AuthUser> {
    const row = await this.prisma.user.update({ where: { id: userId }, data: patch });
    return mapUserRowToDomain(row);
  }

  async findTeacherPreferences(userId: string): Promise<TeacherPreferences | null> {
    const row = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!row) return null;
    return {
      lastWorkingClassId: row.lastWorkingClassId ?? null,
      myClassesDetailClassId: row.myClassesDetailClassId ?? null,
    };
  }

  async updateTeacherPreferences(userId: string, patch: Partial<TeacherPreferences>): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: patch });
  }
}
