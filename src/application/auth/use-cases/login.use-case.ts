import { Injectable } from "@nestjs/common";
import type { LoginDto } from "../dtos/login.dto";
import type { AuthUser } from "../../../domain/auth/entities/auth-user.entity";
import { UserRepositoryPort } from "../../../domain/auth/ports/user.repository.port";
import { PasswordServicePort } from "../../../domain/auth/ports/password.service.port";
import { TokenServicePort } from "../../../domain/auth/ports/token.service.port";
import { AppError } from "../../../common/errors/app.error";

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
    private readonly tokens: TokenServicePort,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const ok = await this.passwords.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const accessToken = await this.tokens.sign({
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
