import * as bcrypt from "bcryptjs";
import { Injectable } from "@nestjs/common";
import { PasswordServicePort } from "../../domain/auth/ports/password.service.port";

const SALT_ROUNDS = 12;

@Injectable()
export class PasswordServiceImpl extends PasswordServicePort {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
