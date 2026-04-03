export type VocabularyTerm = {
  id: string;
  unitId: string;
  wordEn: string;
  wordVi: string;
  imageUrl: string | null;
  audioUrl: string | null;
  exampleSentence: string | null;
  createdAt: Date;
};

export type VocabularyUnit = {
  id: string;
  teacherId: string;
  title: string;
  createdAt: Date;
  terms?: VocabularyTerm[];
};
