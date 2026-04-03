import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { UnitRepositoryPort } from "../../../../domain/unit/ports/unit.repository.port";
import type { VocabularyTerm, VocabularyUnit } from "../../../../domain/unit/entities/unit.entity";

@Injectable()
export class UnitRepositoryAdapter extends UnitRepositoryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<VocabularyUnit | null> {
    const row = await this.prisma.vocabularyUnit.findUnique({
      where: { id },
      include: { terms: { orderBy: { createdAt: "asc" } } },
    });
    if (!row) return null;
    return { ...row, terms: row.terms };
  }

  async findByTeacherId(teacherId: string): Promise<VocabularyUnit[]> {
    const rows = await this.prisma.vocabularyUnit.findMany({
      where: { teacherId },
      include: { terms: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((r) => ({ ...r, terms: r.terms }));
  }

  async create(input: { teacherId: string; title: string }): Promise<VocabularyUnit> {
    const row = await this.prisma.vocabularyUnit.create({
      data: input,
      include: { terms: true },
    });
    return { ...row, terms: row.terms };
  }

  async update(id: string, input: { title: string }): Promise<VocabularyUnit> {
    const row = await this.prisma.vocabularyUnit.update({
      where: { id },
      data: input,
      include: { terms: true },
    });
    return { ...row, terms: row.terms };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vocabularyUnit.delete({ where: { id } });
  }

  async findTermById(id: string): Promise<VocabularyTerm | null> {
    return this.prisma.vocabularyTerm.findUnique({ where: { id } });
  }

  async findTermsByUnitId(unitId: string): Promise<VocabularyTerm[]> {
    return this.prisma.vocabularyTerm.findMany({
      where: { unitId },
      orderBy: { createdAt: "asc" },
    });
  }

  async createTerm(input: {
    unitId: string;
    wordEn: string;
    wordVi: string;
    imageUrl?: string | null;
    audioUrl?: string | null;
    exampleSentence?: string | null;
  }): Promise<VocabularyTerm> {
    return this.prisma.vocabularyTerm.create({ data: input });
  }

  async updateTerm(
    id: string,
    input: Partial<Pick<VocabularyTerm, "wordEn" | "wordVi" | "imageUrl" | "audioUrl" | "exampleSentence">>,
  ): Promise<VocabularyTerm> {
    return this.prisma.vocabularyTerm.update({ where: { id }, data: input });
  }

  async deleteTerm(id: string): Promise<void> {
    await this.prisma.vocabularyTerm.delete({ where: { id } });
  }

  async countTermsByClassId(classId: string): Promise<number> {
    return this.prisma.vocabularyTerm.count({
      where: { unit: { classUnits: { some: { classId } } } },
    });
  }
}
