import { Module } from "@nestjs/common";
import { TermController } from "./term.controller";
import { ClassRepositoryPort } from "../../domain/class/ports/class.repository.port";
import { TermRepositoryPort } from "../../domain/term/ports/term.repository.port";
import { ClassRepositoryAdapter } from "../../infrastructure/database/prisma/class/class.repository.adapter";
import { TermRepositoryAdapter } from "../../infrastructure/database/prisma/term/term.repository.adapter";
import { ListTermsUseCase } from "../../application/term/use-cases/list-terms.use-case";
import { CreateTermUseCase } from "../../application/term/use-cases/create-term.use-case";
import { GetTermUseCase } from "../../application/term/use-cases/get-term.use-case";
import { UpdateTermUseCase } from "../../application/term/use-cases/update-term.use-case";
import { DeleteTermUseCase } from "../../application/term/use-cases/delete-term.use-case";
import { SetTermAudioUseCase } from "../../application/term/use-cases/set-term-audio.use-case";

@Module({
  controllers: [TermController],
  providers: [
    { provide: ClassRepositoryPort, useClass: ClassRepositoryAdapter },
    { provide: TermRepositoryPort, useClass: TermRepositoryAdapter },
    ListTermsUseCase,
    CreateTermUseCase,
    GetTermUseCase,
    UpdateTermUseCase,
    DeleteTermUseCase,
    SetTermAudioUseCase,
  ],
  exports: [
    TermRepositoryPort,
    ListTermsUseCase,
    CreateTermUseCase,
    GetTermUseCase,
    UpdateTermUseCase,
    DeleteTermUseCase,
    SetTermAudioUseCase,
  ],
})
export class TermModule {}
