import { Injectable } from "@nestjs/common";
import { UnitRepositoryPort } from "../../../domain/unit/ports/unit.repository.port";
import { AppError } from "../../../common/errors/app.error";

@Injectable()
export class UnitUseCase {
  constructor(private readonly units: UnitRepositoryPort) {}

  // ── Units ──────────────────────────────────────────────────────────────────

  async listUnits(teacherId: string) {
    const units = await this.units.findByTeacherId(teacherId);
    return { units };
  }

  async createUnit(teacherId: string, title: string) {
    if (!title?.trim()) throw AppError.badRequest("title là bắt buộc");
    const unit = await this.units.create({ teacherId, title: title.trim() });
    return { unitId: unit.id };
  }

  async updateUnit(teacherId: string, unitId: string, title: string) {
    if (!title?.trim()) throw AppError.badRequest("title là bắt buộc");
    const unit = await this.units.findById(unitId);
    if (!unit) throw AppError.notFound("Unit không tồn tại");
    if (unit.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");
    await this.units.update(unitId, { title: title.trim() });
    return { ok: true };
  }

  async deleteUnit(teacherId: string, unitId: string) {
    const unit = await this.units.findById(unitId);
    if (!unit) throw AppError.notFound("Unit không tồn tại");
    if (unit.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");
    await this.units.delete(unitId);
    return { ok: true };
  }

  // ── Terms ──────────────────────────────────────────────────────────────────

  async createTerm(
    teacherId: string,
    unitId: string,
    input: {
      wordEn: string;
      wordVi: string;
      imageUrl?: string | null;
      audioUrl?: string | null;
      exampleSentence?: string | null;
    },
  ) {
    const unit = await this.units.findById(unitId);
    if (!unit) throw AppError.notFound("Unit không tồn tại");
    if (unit.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");

    const wordEn = input.wordEn?.trim();
    const wordVi = input.wordVi?.trim();
    if (!wordEn || !wordVi) throw AppError.badRequest("wordEn và wordVi là bắt buộc");

    const term = await this.units.createTerm({
      unitId,
      wordEn,
      wordVi,
      imageUrl: input.imageUrl ?? null,
      audioUrl: input.audioUrl ?? null,
      exampleSentence: input.exampleSentence ?? null,
    });
    return { termId: term.id };
  }

  async updateTerm(
    teacherId: string,
    termId: string,
    input: {
      wordEn?: string;
      wordVi?: string;
      imageUrl?: string | null;
      audioUrl?: string | null;
      exampleSentence?: string | null;
    },
  ) {
    const term = await this.units.findTermById(termId);
    if (!term) throw AppError.notFound("Term không tồn tại");

    const unit = await this.units.findById(term.unitId);
    if (!unit || unit.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");

    await this.units.updateTerm(termId, {
      wordEn: input.wordEn?.trim(),
      wordVi: input.wordVi?.trim(),
      imageUrl: input.imageUrl,
      audioUrl: input.audioUrl,
      exampleSentence: input.exampleSentence,
    });
    return { ok: true };
  }

  async deleteTerm(teacherId: string, termId: string) {
    const term = await this.units.findTermById(termId);
    if (!term) throw AppError.notFound("Term không tồn tại");

    const unit = await this.units.findById(term.unitId);
    if (!unit || unit.teacherId !== teacherId) throw AppError.forbidden("Không có quyền");

    await this.units.deleteTerm(termId);
    return { ok: true };
  }
}
