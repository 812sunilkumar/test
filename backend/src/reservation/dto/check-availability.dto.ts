import { IsString, IsNotEmpty, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @IsDateString()
  @IsNotEmpty()
  startDateTime: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(480) // Max 8 hours
  durationMins: number;
}

