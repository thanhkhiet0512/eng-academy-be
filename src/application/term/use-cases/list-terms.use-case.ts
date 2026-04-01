import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { TermRepositoryPort } from "../../../domain/term/ports/term.repository.port";
import type { TermEntity } from "../../../domain/term/entities/term.entity";
import { AppError } from "../../../common/errors/app.error";

// Use case: teacher lists all vocabulary terms for a class they own
@Injectable()
export class ListTermsUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly terms: TermRepositoryPort,
  ) {}

  async execute(classId: string, teacherId: string): Promise<{ terms: TermEntity[] }> {
    const id = classId.trim();
    if (!id) throw AppError.badRequest("classId required");

    const classroom = await this.classes.findById(id);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const terms = await this.terms.findByClassId(id);
    return { terms };
  }
}
