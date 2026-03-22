import { IsOptional, IsString, MinLength } from "class-validator";

export class PatchTeacherPreferencesDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  lastWorkingClassId?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  myClassesDetailClassId?: string | null;
}
