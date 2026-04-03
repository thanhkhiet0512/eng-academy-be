import type { Exercise } from "./exercise.entity";

export type Lesson = {
  id: string;
  teacherId: string;
  unitTitle: string;
  topic: string;
  coverImageUrl?: string | null;
  termIds: string[];
  exercises: Exercise[];
  createdAt: Date;
};
