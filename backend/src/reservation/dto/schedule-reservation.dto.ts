import { IsString, IsNotEmpty, IsDateString, IsInt, Min, Max, IsEmail, IsOptional } from 'class-validator';

export class ScheduleReservationDto {
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @IsDateString()
  @IsNotEmpty()
  startDateTime: string;

  @IsInt()
  @Min(1)
  @Max(480) // Max 8 hours
  durationMins: number;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;
}

