import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { LoginDto } from "../dtos/login.dto";
import type { AuthUser } from "../../../domain/auth/entities/auth-user.entity";
import { UserRepositoryPort } from "../../../domain/auth/ports/user.repository.port";
import { PasswordServicePort } from "../../../domain/auth/ports/password.service.port";

export type LoginResult = {
  accessToken: string;
  tokenType: "Bearer";
  user: Pick<AuthUser, "id" | "email" | "name" | "role">;
};

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly passwords: PasswordServicePort,
    private readonly jwt: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const ok = await this.passwords.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

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
}
