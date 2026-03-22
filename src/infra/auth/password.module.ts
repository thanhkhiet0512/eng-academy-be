import { Module } from "@nestjs/common";
import { PasswordServicePort } from "../../domain/auth/ports/password.service.port";
import { PasswordServiceImpl } from "./password.service.impl";

@Module({
  providers: [{ provide: PasswordServicePort, useClass: PasswordServiceImpl }],
  exports: [PasswordServicePort],
})
export class PasswordModule {}
