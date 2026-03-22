import type { TermEntity } from "../entities/term.entity";

// Port (abstract class used as NestJS DI token) for vocabulary term persistence
export abstract class TermRepositoryPort {
  abstract findById(id: string): Promise<TermEntity | null>;
  abstract findByClassId(classId: string): Promise<TermEntity[]>;
  abstract countByClassId(classId: string): Promise<number>;
  abstract create(input: {
    classId: string;
    wordEn: string;
    wordVi: string;
    imageUrl?: string | null;
    exampleSentence?: string | null;
  }): Promise<TermEntity>;
  abstract update(
    id: string,
    input: Partial<Pick<TermEntity, "wordEn" | "wordVi" | "imageUrl" | "audioUrl" | "exampleSentence">>,
  ): Promise<TermEntity>;
  abstract updateAudioByIdAndClassId(id: string, classId: string, audioUrl: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
