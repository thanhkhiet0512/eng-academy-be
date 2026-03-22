import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { TermRepositoryPort } from "../../../../domain/term/ports/term.repository.port";
import type { TermEntity } from "../../../../domain/term/entities/term.entity";

// Implements TermRepositoryPort — maps Prisma rows to domain TermEntity
@Injectable()
export class TermRepositoryAdapter extends TermRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<TermEntity | null> {
    const row = await this.prisma.vocabularyTerm.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findByClassId(classId: string): Promise<TermEntity[]> {
    const rows = await this.prisma.vocabularyTerm.findMany({
      where: { classId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => this.map(r));
  }

  async countByClassId(classId: string): Promise<number> {
    return this.prisma.vocabularyTerm.count({ where: { classId } });
  }

  async create(input: {
    classId: string;
    wordEn: string;
    wordVi: string;
    imageUrl?: string | null;
    exampleSentence?: string | null;
  }): Promise<TermEntity> {
    const row = await this.prisma.vocabularyTerm.create({
      data: {
        classId: input.classId,
        wordEn: input.wordEn,
        wordVi: input.wordVi,
        imageUrl: input.imageUrl ?? null,
        exampleSentence: input.exampleSentence ?? null,
      },
    });
    return this.map(row);
  }

  async update(
    id: string,
    input: Partial<Pick<TermEntity, "wordEn" | "wordVi" | "imageUrl" | "audioUrl" | "exampleSentence">>,
  ): Promise<TermEntity> {
    const row = await this.prisma.vocabularyTerm.update({ where: { id }, data: input });
    return this.map(row);
  }

  // Update audio only when term belongs to the given class (ownership check at DB level)
  async updateAudioByIdAndClassId(id: string, classId: string, audioUrl: string): Promise<void> {
    await this.prisma.vocabularyTerm.updateMany({ where: { id, classId }, data: { audioUrl } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vocabularyTerm.delete({ where: { id } });
  }

  private map(row: {
    id: string;
    classId: string;
    wordEn: string;
    wordVi: string;
    imageUrl: string | null;
    audioUrl: string | null;
    exampleSentence: string | null;
    createdAt: Date;
  }): TermEntity {
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
}
