import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { TermRepositoryPort } from "../../../domain/term/ports/term.repository.port";

// Use case: teacher sets the audio URL for a vocabulary term they own
@Injectable()
export class SetTermAudioUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly terms: TermRepositoryPort,
  ) {}

  async execute(termId: string, classId: string, teacherId: string, audioUrl: string): Promise<{ ok: true }> {
    if (!classId.trim() || !audioUrl.trim()) {
      throw new BadRequestException("classId and audioUrl are required");
    }

    const classroom = await this.classes.findById(classId.trim());
    if (!classroom || classroom.teacherId !== teacherId) {
      throw new ForbiddenException("Bạn không có quyền với lớp này");
    }

    await this.terms.updateAudioByIdAndClassId(termId, classId.trim(), audioUrl.trim());
    return { ok: true };
  }
}
