export type TokenPayload = {
  sub: string;
  email: string;
  role: string;
};

export abstract class TokenServicePort {
  abstract sign(payload: TokenPayload): Promise<string>;
  abstract verify(token: string): Promise<TokenPayload>;
}
