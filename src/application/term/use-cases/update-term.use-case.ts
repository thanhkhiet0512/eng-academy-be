import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { TermRepositoryPort } from "../../../domain/term/ports/term.repository.port";

export type UpdateTermInput = {
  wordEn?: string;
  wordVi?: string;
  imageUrl?: string;
  audioUrl?: string;
  exampleSentence?: string;
};

// Use case: teacher updates fields of a vocabulary term they own
@Injectable()
export class UpdateTermUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly terms: TermRepositoryPort,
  ) {}

  async execute(termId: string, teacherId: string, input: UpdateTermInput): Promise<{ termId: string }> {
    const term = await this.terms.findById(termId);
    if (!term) throw new NotFoundException("Term not found");

    const classroom = await this.classes.findById(term.classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw new ForbiddenException("Bạn không có quyền với lớp này");
    }

    const updated = await this.terms.update(termId, input);
    return { termId: updated.id };
  }
}
