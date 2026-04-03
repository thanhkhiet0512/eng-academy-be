import { Injectable } from "@nestjs/common";
import type { Exercise } from "../../../domain/lesson/entities/exercise.entity";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import type { CreateLessonDto, ExerciseDto } from "../dtos/create-lesson.dto";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class CreateLessonUseCase {
  constructor(private readonly lessons: LessonRepositoryPort) {}

  async execute(teacherId: string, dto: CreateLessonDto) {
    dto.exercises.forEach((e, idx) => this.assertBusinessRules(e, idx));

    const exercises: Exercise[] = dto.exercises.map((e, idx) => ({
      ...(e as Omit<Exercise, "id">),
      id: `${Date.now()}_${idx}`,
    })) as Exercise[];

    const lesson = await this.lessons.create({
      teacherId,
      unitTitle: dto.unitTitle,
      topic: dto.topic,
      coverImageUrl: dto.coverImageUrl ?? null,
      termIds: dto.termIds,
      exercises,
    });

    return { lessonId: lesson.id };
  }

  private assertBusinessRules(exercise: ExerciseDto, idx: number) {
    const prefix = `Exercise #${idx + 1}`;

    switch (exercise.type) {
      case "multiple_choice":
        if (!exercise.prompt?.trim()) {
          throw AppError.badRequest(`${prefix}: prompt không được để trống`);
        }
        if (!exercise.choices || exercise.choices.length !== 4) {
          throw AppError.badRequest(`${prefix}: multiple_choice cần đúng 4 choices`);
        }
        if (exercise.choices.some((c) => !c?.trim())) {
          throw AppError.badRequest(`${prefix}: choices không được để trống`);
        }
        if (
          typeof exercise.correctIndex !== "number" ||
          exercise.correctIndex < 0 ||
          exercise.correctIndex > 3
        ) {
          throw AppError.badRequest(`${prefix}: correctIndex phải trong khoảng 0..3`);
        }
        return;

      case "matching":
        if (!exercise.pairs || exercise.pairs.length < 2 || exercise.pairs.length > 8) {
          throw AppError.badRequest(`${prefix}: matching cần 2 đến 8 pairs`);
        }
        if (exercise.pairs.some((p) => !p.left?.trim() || !p.right?.trim())) {
          throw AppError.badRequest(`${prefix}: mỗi pair cần left/right hợp lệ`);
        }
        return;

      case "fill_blank": {
        const sentence = exercise.sentence?.trim() ?? "";
        const answer = exercise.answer?.trim() ?? "";
        const blankCount = sentence.split("___").length - 1;
        if (!sentence || blankCount !== 1) {
          throw AppError.badRequest(`${prefix}: sentence phải chứa đúng 1 placeholder ___`);
        }
        if (!answer) {
          throw AppError.badRequest(`${prefix}: answer không được để trống`);
        }
        return;
      }

      case "word_arrangement":
        if (!exercise.answer?.trim()) {
          throw AppError.badRequest(`${prefix}: answer không được để trống`);
        }
        if (!exercise.words || exercise.words.length < 2) {
          throw AppError.badRequest(`${prefix}: words phải có tối thiểu 2 từ`);
        }
        if (exercise.words.some((w) => !w?.trim())) {
          throw AppError.badRequest(`${prefix}: words không được để trống`);
        }
        return;
    }
  }
}
