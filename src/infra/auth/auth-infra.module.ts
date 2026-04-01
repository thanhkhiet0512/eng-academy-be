import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PasswordServicePort } from "../../domain/auth/ports/password.service.port";
import { TokenServicePort } from "../../domain/auth/ports/token.service.port";
import { PasswordServiceImpl } from "./password.service.impl";
import { TokenServiceImpl } from "./token.service.impl";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("AUTH_SECRET"),
        signOptions: { expiresIn: "7d" },
      }),
    }),
  ],
  providers: [
    { provide: PasswordServicePort, useClass: PasswordServiceImpl },
    { provide: TokenServicePort, useClass: TokenServiceImpl },
  ],
  exports: [PasswordServicePort, TokenServicePort, JwtModule],
})
export class AuthInfraModule {}
