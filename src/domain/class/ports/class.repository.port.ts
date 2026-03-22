export abstract class ClassRepositoryPort {
  abstract findById(id: string): Promise<{ id: string; teacherId: string } | null>;
}
