import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserRepositoryPort } from "../../domain/auth/ports/user.repository.port";
import type { RequestUser } from "../types/request-user.type";

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly config: ConfigService,
    private readonly users: UserRepositoryPort,
  ) {
    const fromCookie = (req: { headers?: { cookie?: string } }): string | null => {
      const raw = req?.headers?.cookie;
      if (!raw) return null;
      const chunks = raw.split(";").map((x) => x.trim());
      const found = chunks.find((x) => x.startsWith("ea_session="));
      if (!found) return null;
      return decodeURIComponent(found.slice("ea_session=".length));
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        fromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("AUTH_SECRET"),
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
