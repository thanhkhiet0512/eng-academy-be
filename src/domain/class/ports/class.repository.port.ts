import type { ClassEntity, ClassStatus } from "../entities/class.entity";

// Port (abstract class used as NestJS DI token) for class persistence
export abstract class ClassRepositoryPort {
  abstract findById(id: string): Promise<ClassEntity | null>;
  abstract findByTeacherId(teacherId: string, status?: ClassStatus): Promise<ClassEntity[]>;
  abstract findByCode(code: string): Promise<ClassEntity[]>;
  abstract findByName(name: string): Promise<ClassEntity[]>;
  abstract codeExistsForTeacher(teacherId: string, code: string): Promise<boolean>;
  abstract nameExistsForTeacher(teacherId: string, name: string): Promise<boolean>;
  abstract countByTeacherId(teacherId: string): Promise<number>;
  abstract create(input: {
    id: string;
    name: string;
    gradeLevel: string;
    code: string;
    teacherId: string;
  }): Promise<ClassEntity>;
  abstract setStatus(id: string, status: ClassStatus): Promise<void>;
}
