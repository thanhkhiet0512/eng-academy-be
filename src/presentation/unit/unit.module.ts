import { Module } from "@nestjs/common";
import { UnitUseCase } from "../../application/unit/use-cases/unit.use-case";
import { UnitRepositoryPort } from "../../domain/unit/ports/unit.repository.port";
import { UnitRepositoryAdapter } from "../../infrastructure/database/prisma/unit/unit.repository.adapter";
import { UnitController } from "./unit.controller";

@Module({
  controllers: [UnitController],
  providers: [
    UnitUseCase,
    { provide: UnitRepositoryPort, useClass: UnitRepositoryAdapter },
  ],
})
export class UnitModule {}
