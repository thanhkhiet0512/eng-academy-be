export abstract class StudentRepositoryPort {
  abstract findById(id: string): Promise<{ id: string; classId: string } | null>;
}
