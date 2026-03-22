export type MultipleChoiceExercise = {
  id: string;
  type: "multiple_choice";
  prompt: string;
  choices: string[];
  correctIndex: number;
};

export type MatchingExercise = {
  id: string;
  type: "matching";
  pairs: { left: string; right: string }[];
};

export type FillBlankExercise = {
  id: string;
  type: "fill_blank";
  sentence: string;
  answer: string;
  hint?: string;
};

export type WordArrangementExercise = {
  id: string;
  type: "word_arrangement";
  words: string[];
  answer: string;
};

export type Exercise =
  | MultipleChoiceExercise
  | MatchingExercise
  | FillBlankExercise
  | WordArrangementExercise;
