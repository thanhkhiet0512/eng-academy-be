import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { TermRepositoryPort } from "../../../domain/term/ports/term.repository.port";
import { AppError } from "../../../common/errors/app.error";

// Use case: teacher deletes a vocabulary term they own
@Injectable()
export class DeleteTermUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly terms: TermRepositoryPort,
  ) {}

  async execute(termId: string, teacherId: string): Promise<{ ok: true }> {
    const term = await this.terms.findById(termId);
    if (!term) throw AppError.notFound("Term not found");

    const classroom = await this.classes.findById(term.classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    await this.terms.delete(termId);
    return { ok: true };
  }
}
