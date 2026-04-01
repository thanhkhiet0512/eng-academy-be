import type { TermEntity } from "../../../../domain/term/entities/term.entity";

export type TermRow = {
  id: string;
  classId: string;
  wordEn: string;
  wordVi: string;
  imageUrl: string | null;
  audioUrl: string | null;
  exampleSentence: string | null;
  createdAt: Date;
};

export function mapTermRowToDomain(row: TermRow): TermEntity {
  return {
    id: row.id,
    classId: row.classId,
    wordEn: row.wordEn,
    wordVi: row.wordVi,
    imageUrl: row.imageUrl,
    audioUrl: row.audioUrl,
    exampleSentence: row.exampleSentence,
    createdAt: row.createdAt,
  };
}
