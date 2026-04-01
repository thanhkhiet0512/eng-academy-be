import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenServicePort, type TokenPayload } from "../../domain/auth/ports/token.service.port";

@Injectable()
export class TokenServiceImpl extends TokenServicePort {
  constructor(private readonly jwt: JwtService) {
    super();
  }

  async sign(payload: TokenPayload): Promise<string> {
    return this.jwt.signAsync(payload);
  }

  async verify(token: string): Promise<TokenPayload> {
    return this.jwt.verifyAsync<TokenPayload>(token);
  }
}
