import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Exercise } from "../../../domain/lesson/entities/exercise.entity";
import { ClassRepositoryPort } from "../../../domain/class/ports/class.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import type { CreateLessonDto, ExerciseDto } from "../dtos/create-lesson.dto";

@Injectable()
export class CreateLessonUseCase {
  constructor(
    private readonly lessons: LessonRepositoryPort,
    private readonly classes: ClassRepositoryPort,
  ) {}

  async execute(teacherId: string, dto: CreateLessonDto) {
    const classroom = await this.classes.findById(dto.classId);
    if (!classroom) throw new NotFoundException("Lớp không tồn tại");
    if (classroom.teacherId !== teacherId) throw new ForbiddenException("Không có quyền");

    dto.exercises.forEach((e, idx) => this.assertBusinessRules(e, idx));

    const exercises: Exercise[] = dto.exercises.map((e, idx) => ({
      ...(e as Omit<Exercise, "id">),
      id: `${Date.now()}_${idx}`,
    })) as Exercise[];

    const lesson = await this.lessons.create({
      classId: dto.classId,
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
          throw new BadRequestException(`${prefix}: prompt không được để trống`);
        }
        if (!exercise.choices || exercise.choices.length !== 4) {
          throw new BadRequestException(`${prefix}: multiple_choice cần đúng 4 choices`);
        }
        if (exercise.choices.some((c) => !c?.trim())) {
          throw new BadRequestException(`${prefix}: choices không được để trống`);
        }
        if (
          typeof exercise.correctIndex !== "number" ||
          exercise.correctIndex < 0 ||
          exercise.correctIndex > 3
        ) {
          throw new BadRequestException(`${prefix}: correctIndex phải trong khoảng 0..3`);
        }
        return;

      case "matching":
        if (!exercise.pairs || exercise.pairs.length < 2 || exercise.pairs.length > 8) {
          throw new BadRequestException(`${prefix}: matching cần 2 đến 8 pairs`);
        }
        if (exercise.pairs.some((p) => !p.left?.trim() || !p.right?.trim())) {
          throw new BadRequestException(`${prefix}: mỗi pair cần left/right hợp lệ`);
        }
        return;

      case "fill_blank": {
        const sentence = exercise.sentence?.trim() ?? "";
        const answer = exercise.answer?.trim() ?? "";
        const blankCount = sentence.split("___").length - 1;
        if (!sentence || blankCount !== 1) {
          throw new BadRequestException(`${prefix}: sentence phải chứa đúng 1 placeholder ___`);
        }
        if (!answer) {
          throw new BadRequestException(`${prefix}: answer không được để trống`);
        }
        return;
      }

      case "word_arrangement":
        if (!exercise.answer?.trim()) {
          throw new BadRequestException(`${prefix}: answer không được để trống`);
        }
        if (!exercise.words || exercise.words.length < 2) {
          throw new BadRequestException(`${prefix}: words phải có tối thiểu 2 từ`);
        }
        if (exercise.words.some((w) => !w?.trim())) {
          throw new BadRequestException(`${prefix}: words không được để trống`);
        }
        return;
    }
  }
}
