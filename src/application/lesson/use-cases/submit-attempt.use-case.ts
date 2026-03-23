import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Exercise } from "../../../domain/lesson/entities/exercise.entity";
import { AttemptRepositoryPort } from "../../../domain/lesson/ports/attempt.repository.port";
import { LessonRepositoryPort } from "../../../domain/lesson/ports/lesson.repository.port";
import { StudentRepositoryPort } from "../../../domain/student/ports/student.repository.port";
import type { AnswerDto, SubmitAttemptDto } from "../dtos/submit-attempt.dto";

@Injectable()
export class SubmitAttemptUseCase {
  constructor(
    private readonly lessons: LessonRepositoryPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly students: StudentRepositoryPort,
  ) {}

  async execute(dto: SubmitAttemptDto) {
    const student = await this.students.findById(dto.studentId);
    if (!student) throw new NotFoundException("Học sinh không tồn tại");

    const lesson = await this.lessons.findById(dto.lessonId);
    if (!lesson) throw new NotFoundException("Bài học không tồn tại");

    if (student.classId !== lesson.classId) {
      throw new ForbiddenException("Bài học không thuộc lớp của bạn");
    }

    let score = 0;
    const breakdown = lesson.exercises.map((exercise) => {
      const answer = dto.answers.find((a) => a.exerciseId === exercise.id);
      const correct = answer ? this.grade(exercise, answer) : false;
      if (correct) score += 1;
      return { exerciseId: exercise.id, type: exercise.type, correct };
    });

    await this.attempts.create({
      studentId: student.id,
      classId: lesson.classId,
      lessonId: lesson.id,
      score,
      total: lesson.exercises.length,
    });

    return { score, total: lesson.exercises.length, breakdown };
  }

  private grade(exercise: Exercise, answer: AnswerDto): boolean {
    switch (exercise.type) {
      case "multiple_choice":
        return answer.selectedIndex === exercise.correctIndex;

      case "matching":
        if (!answer.pairs?.length) return false;
        if (answer.pairs.length !== exercise.pairs.length) return false;
        return answer.pairs.every(({ leftIndex, rightIndex }) => leftIndex === rightIndex);

      case "fill_blank": {
        if (!answer.text) return false;
        const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
        return normalize(answer.text) === normalize(exercise.answer);
      }

      case "word_arrangement": {
        if (!answer.arranged?.length) return false;
        const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
        const reconstructed = answer.arranged.map((i) => exercise.words[i] ?? "").join(" ");
        return normalize(reconstructed) === normalize(exercise.answer);
      }
    }
  }
}
