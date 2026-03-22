import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { RegisterUseCase } from "../../application/auth/use-cases/register.use-case";
import { LoginUseCase } from "../../application/auth/use-cases/login.use-case";
import { UserRepositoryPort } from "../../domain/auth/ports/user.repository.port";
import { UserRepositoryAdapter } from "../../infrastructure/database/prisma/user.repository.adapter";
import { PasswordModule } from "../../infra/auth/password.module";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { JwtStrategy } from "../../auth/strategies/jwt.strategy";
import { AuthController } from "./auth.controller";

@Module({
  imports: [
    ConfigModule,
    PasswordModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>("AUTH_SECRET");
        if (!secret || secret.length < 16) {
          throw new Error("AUTH_SECRET must be set (min 16 characters)");
        }
        return {
          secret,
          signOptions: { expiresIn: "7d" },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    JwtStrategy,
    { provide: UserRepositoryPort, useClass: UserRepositoryAdapter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
