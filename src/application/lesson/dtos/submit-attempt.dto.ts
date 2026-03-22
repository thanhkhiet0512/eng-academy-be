import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MatchingPairAnswerDto {
  @ApiProperty()
  @IsNumber()
  leftIndex!: number;

  @ApiProperty()
  @IsNumber()
  rightIndex!: number;
}

export class AnswerDto {
  @ApiProperty()
  @IsString()
  exerciseId!: string;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  selectedIndex?: number;

  @ApiPropertyOptional({ type: [MatchingPairAnswerDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MatchingPairAnswerDto)
  pairs?: MatchingPairAnswerDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  arranged?: string[];
}

export class SubmitAttemptDto {
  @ApiProperty()
  @IsString()
  studentId!: string;

  @ApiProperty()
  @IsString()
  lessonId!: string;

  @ApiProperty({ type: [AnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];
}
