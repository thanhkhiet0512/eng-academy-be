import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { UserRepositoryPort } from "../../../domain/auth/ports/user.repository.port";
import type { TeacherPreferences } from "../../../domain/auth/ports/user.repository.port";

export type PatchPreferencesInput = {
  lastWorkingClassId?: string | null;
  myClassesDetailClassId?: string | null;
};

// Use case: update teacher preference fields; validates class ownership before saving
@Injectable()
export class PatchTeacherPreferencesUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly classes: ClassRepositoryPort,
  ) {}

  async execute(teacherId: string, input: PatchPreferencesInput): Promise<{ ok: true }> {
    const patch: Partial<TeacherPreferences> = {};

    if ("lastWorkingClassId" in input) {
      const id = input.lastWorkingClassId?.trim();
      if (id) {
        // Verify teacher owns this class before saving
        const cls = await this.classes.findById(id);
        if (cls && cls.teacherId === teacherId) patch.lastWorkingClassId = id;
      } else {
        patch.lastWorkingClassId = null;
      }
    }

    if ("myClassesDetailClassId" in input) {
      const id = input.myClassesDetailClassId?.trim();
      if (id) {
        const cls = await this.classes.findById(id);
        if (cls && cls.teacherId === teacherId) patch.myClassesDetailClassId = id;
      } else {
        patch.myClassesDetailClassId = null;
      }
    }

    if (Object.keys(patch).length > 0) {
      await this.users.updateTeacherPreferences(teacherId, patch);
    }

    return { ok: true };
  }
}
