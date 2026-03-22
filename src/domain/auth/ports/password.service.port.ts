export abstract class PasswordServicePort {
  abstract hash(plain: string): Promise<string>;
  abstract compare(plain: string, hashed: string): Promise<boolean>;
}
