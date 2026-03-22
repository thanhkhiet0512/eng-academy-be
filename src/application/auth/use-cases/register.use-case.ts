import { ConflictException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { RegisterDto } from "../dtos/register.dto";
import type { AuthUser } from "../../../domain/auth/entities/auth-user.entity";
import { UserRepositoryPort } from "../../../domain/auth/ports/user.repository.port";
import { PasswordServicePort } from "../../../domain/auth/ports/password.service.port";

export type RegisterResult = {
  accessToken: string;
  tokenType: "Bearer";
  user: Pick<AuthUser, "id" | "email" | "name" | "role">;
};

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly passwords: PasswordServicePort,
    private readonly jwt: JwtService,
  ) {}

  async execute(dto: RegisterDto): Promise<RegisterResult> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await this.passwords.hash(dto.password);
    const user = await this.users.create({
      email,
      passwordHash,
      name: dto.name.trim(),
      role: "TEACHER",
    });

    const accessToken = await this.signAccessToken(user);
    return {
      accessToken,
      tokenType: "Bearer",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  private async signAccessToken(user: AuthUser): Promise<string> {
    return this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
