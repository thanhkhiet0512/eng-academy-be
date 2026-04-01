import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { TermRepositoryPort } from "../../../domain/term/ports/term.repository.port";
import { AppError } from "../../../common/errors/app.error";

// Use case: teacher sets the audio URL for a vocabulary term they own
@Injectable()
export class SetTermAudioUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly terms: TermRepositoryPort,
  ) {}

  async execute(termId: string, classId: string, teacherId: string, audioUrl: string): Promise<{ ok: true }> {
    if (!classId.trim() || !audioUrl.trim()) {
      throw AppError.badRequest("classId and audioUrl are required");
    }

    const classroom = await this.classes.findById(classId.trim());
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    await this.terms.updateAudioByIdAndClassId(termId, classId.trim(), audioUrl.trim());
    return { ok: true };
  }
}
