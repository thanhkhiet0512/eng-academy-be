import { Module } from "@nestjs/common";
import { ClassroomModule } from "../classroom/classroom.module";
import { TermModule } from "../term/term.module";
import { StudentModule } from "../student/student.module";
import { ParentModule } from "../parent/parent.module";
import { ImportModule } from "../import/import.module";
import { UploadModule } from "../upload/upload.module";

// Aggregate module — each sub-module owns its own controller
@Module({
  imports: [
    ClassroomModule,
    TermModule,
    StudentModule,
    ParentModule,
    ImportModule,
    UploadModule,
  ],
})
export class PortalModule {}
