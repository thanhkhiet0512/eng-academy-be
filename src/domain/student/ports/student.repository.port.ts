import type { StudentEntity } from "../entities/student.entity";

// Port (abstract class used as NestJS DI token) for student persistence
export abstract class StudentRepositoryPort {
  abstract findById(id: string): Promise<StudentEntity | null>;
  abstract findByClassId(classId: string): Promise<StudentEntity[]>;
  abstract findByClassIdAndName(classId: string, name: string): Promise<StudentEntity[]>;
  abstract countByClassId(classId: string): Promise<number>;
  abstract codeExistsInClass(classId: string, code: string): Promise<boolean>;
  abstract create(input: {
    id: string;
    classId: string;
    name: string;
    code: string;
    dateOfBirth?: Date | null;
    parentName?: string | null;
    parentPhone?: string | null;
  }): Promise<StudentEntity>;
  abstract delete(id: string): Promise<void>;
}
