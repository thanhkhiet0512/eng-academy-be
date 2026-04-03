import type { VocabularyTerm, VocabularyUnit } from "../entities/unit.entity";

export abstract class UnitRepositoryPort {
  abstract findById(id: string): Promise<VocabularyUnit | null>;
  abstract findByTeacherId(teacherId: string): Promise<VocabularyUnit[]>;
  abstract create(input: { teacherId: string; title: string }): Promise<VocabularyUnit>;
  abstract update(id: string, input: { title: string }): Promise<VocabularyUnit>;
  abstract delete(id: string): Promise<void>;

  // Terms
  abstract findTermById(id: string): Promise<VocabularyTerm | null>;
  abstract findTermsByUnitId(unitId: string): Promise<VocabularyTerm[]>;
  abstract createTerm(input: {
    unitId: string;
    wordEn: string;
    wordVi: string;
    imageUrl?: string | null;
    audioUrl?: string | null;
    exampleSentence?: string | null;
  }): Promise<VocabularyTerm>;
  abstract updateTerm(
    id: string,
    input: Partial<Pick<VocabularyTerm, "wordEn" | "wordVi" | "imageUrl" | "audioUrl" | "exampleSentence">>,
  ): Promise<VocabularyTerm>;
  abstract deleteTerm(id: string): Promise<void>;
  abstract countTermsByClassId(classId: string): Promise<number>;
}
