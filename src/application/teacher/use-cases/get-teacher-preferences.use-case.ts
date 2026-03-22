import { ForbiddenException, Injectable } from "@nestjs/common";
import { UserRepositoryPort } from "../../../domain/auth/ports/user.repository.port";
import type { TeacherPreferences } from "../../../domain/auth/ports/user.repository.port";

// Use case: return the stored preferences for the authenticated teacher
@Injectable()
export class GetTeacherPreferencesUseCase {
  constructor(private readonly users: UserRepositoryPort) {}

  async execute(userId: string): Promise<TeacherPreferences> {
    const prefs = await this.users.findTeacherPreferences(userId);
    if (!prefs) throw new ForbiddenException("Unauthorized");
    return prefs;
  }
}
