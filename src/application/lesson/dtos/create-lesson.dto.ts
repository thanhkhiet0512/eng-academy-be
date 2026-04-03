import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Matches,
  Min,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MatchingPairDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  left!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  right!: string;
}

export class ExerciseDto {
  @ApiProperty({ enum: ["multiple_choice", "matching", "fill_blank", "word_arrangement"] })
  @IsIn(["multiple_choice", "matching", "fill_blank", "word_arrangement"])
  type!: string;

  @ApiPropertyOptional()
  @ValidateIf((o: ExerciseDto) => o.type === "multiple_choice")
  @IsString()
  @IsNotEmpty()
  prompt?: string;

  @ApiPropertyOptional({ type: [String] })
  @ValidateIf((o: ExerciseDto) => o.type === "multiple_choice")
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  choices?: string[];

  @ApiPropertyOptional()
  @ValidateIf((o: ExerciseDto) => o.type === "multiple_choice")
  @IsNumber()
  @Min(0)
  @Max(3)
  correctIndex?: number;

  @ApiPropertyOptional({ type: [MatchingPairDto] })
  @ValidateIf((o: ExerciseDto) => o.type === "matching")
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => MatchingPairDto)
  pairs?: MatchingPairDto[];

  @ApiPropertyOptional()
  @ValidateIf((o: ExerciseDto) => o.type === "fill_blank")
  @IsString()
  @IsNotEmpty()
  @Matches(/___/, { message: "sentence phải chứa ___" })
  sentence?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: ExerciseDto) => o.type === "fill_blank" || o.type === "word_arrangement")
  @IsString()
  @IsNotEmpty()
  answer?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  hint?: string;

  @ApiPropertyOptional({ type: [String] })
  @ValidateIf((o: ExerciseDto) => o.type === "word_arrangement")
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  words?: string[];
}

export class CreateLessonDto {
  @ApiProperty()
  @IsString()
  unitTitle!: string;

  @ApiProperty()
  @IsString()
  topic!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  termIds!: string[];

  @ApiProperty({ type: [ExerciseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  exercises!: ExerciseDto[];
}

export class UpdateLessonDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  unitTitle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  topic?: string;
}
