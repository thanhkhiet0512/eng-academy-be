import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import { RegisterUseCase } from "../../application/auth/use-cases/register.use-case";
import { LoginUseCase } from "../../application/auth/use-cases/login.use-case";
import { UpdateProfileUseCase } from "../../application/auth/use-cases/update-profile.use-case";
import { UserRepositoryPort } from "../../domain/auth/ports/user.repository.port";
import { UserRepositoryAdapter } from "../../infrastructure/database/prisma/user.repository.adapter";
import { AuthInfraModule } from "../../infra/auth/auth-infra.module";
import { JwtAuthGuard } from "../../infra/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../infra/auth/guards/roles.guard";
import { JwtStrategy } from "../../infra/auth/strategies/jwt.strategy";
import { AuthController } from "./auth.controller";

@Module({
  imports: [
    ConfigModule,
    AuthInfraModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    UpdateProfileUseCase,
    JwtStrategy,
    { provide: UserRepositoryPort, useClass: UserRepositoryAdapter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
