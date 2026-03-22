import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { TermRepositoryPort } from "../../../domain/term/ports/term.repository.port";
import type { TermEntity } from "../../../domain/term/entities/term.entity";

// Use case: teacher retrieves a single term and verifies they own its class
@Injectable()
export class GetTermUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly terms: TermRepositoryPort,
  ) {}

  async execute(termId: string, teacherId: string): Promise<TermEntity> {
    const term = await this.terms.findById(termId);
    if (!term) throw new NotFoundException("Term not found");

    const classroom = await this.classes.findById(term.classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw new ForbiddenException("Bạn không có quyền với lớp này");
    }

    return term;
  }
}
