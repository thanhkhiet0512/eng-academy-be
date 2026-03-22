// Domain entity representing a vocabulary term
export type TermEntity = {
  id: string;
  classId: string;
  wordEn: string;
  wordVi: string;
  imageUrl: string | null;
  audioUrl: string | null;
  exampleSentence: string | null;
  createdAt: Date;
};
