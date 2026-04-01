import { Injectable } from "@nestjs/common";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { TermRepositoryPort } from "../../../domain/term/ports/term.repository.port";
import { AppError } from "../../../common/errors/app.error";

export type CreateTermInput = {
  classId: string;
  wordEn: string;
  wordVi: string;
  imageUrl?: string;
  exampleSentence?: string;
};

// Use case: teacher creates a new vocabulary term in a class they own
@Injectable()
export class CreateTermUseCase {
  constructor(
    private readonly classes: ClassRepositoryPort,
    private readonly terms: TermRepositoryPort,
  ) {}

  async execute(teacherId: string, input: CreateTermInput): Promise<{ termId: string }> {
    const classId = input.classId.trim();
    if (!classId) throw AppError.badRequest("classId is required");

    const wordEn = input.wordEn.trim();
    const wordVi = input.wordVi.trim();
    if (!wordEn || !wordVi) throw AppError.badRequest("wordEn and wordVi are required");

    const classroom = await this.classes.findById(classId);
    if (!classroom || classroom.teacherId !== teacherId) {
      throw AppError.forbidden("Bạn không có quyền với lớp này");
    }

    const created = await this.terms.create({
      classId,
      wordEn,
      wordVi,
      imageUrl: input.imageUrl,
      exampleSentence: input.exampleSentence,
    });
    return { termId: created.id };
  }
}
