import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { TermRepositoryPort } from "../../../../domain/term/ports/term.repository.port";
import type { TermEntity } from "../../../../domain/term/entities/term.entity";
import { mapTermRowToDomain } from "./term.mapper";

@Injectable()
export class TermRepositoryAdapter extends TermRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<TermEntity | null> {
    const row = await this.prisma.vocabularyTerm.findUnique({ where: { id } });
    return row ? mapTermRowToDomain(row) : null;
  }

  async findByClassId(classId: string): Promise<TermEntity[]> {
    const rows = await this.prisma.vocabularyTerm.findMany({
      where: { classId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => mapTermRowToDomain(r));
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
    return mapTermRowToDomain(row);
  }

  async update(
    id: string,
    input: Partial<Pick<TermEntity, "wordEn" | "wordVi" | "imageUrl" | "audioUrl" | "exampleSentence">>,
  ): Promise<TermEntity> {
    const row = await this.prisma.vocabularyTerm.update({ where: { id }, data: input });
    return mapTermRowToDomain(row);
  }

  async updateAudioByIdAndClassId(id: string, classId: string, audioUrl: string): Promise<void> {
    await this.prisma.vocabularyTerm.updateMany({ where: { id, classId }, data: { audioUrl } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vocabularyTerm.delete({ where: { id } });
  }
}
