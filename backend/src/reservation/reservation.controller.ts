import { Controller, Post, Body, Get, BadRequestException } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ScheduleReservationDto } from './dto/schedule-reservation.dto';

interface BookingDto extends ScheduleReservationDto {
  location: string;
  vehicleType: string;
}

@Controller()
export class ReservationController {
  constructor(private readonly service: ReservationService) {}

  @Get('status')
  status() {
    return { status: 'ok' };
  }

  @Post('book')
  async book(@Body() body: BookingDto) {
    try {
      return await this.service.checkAndBook(
        body.location,
        body.vehicleType,
        body.startDateTime,
        body.durationMins,
        body.customerName,
        body.customerEmail,
        body.customerPhone
      );
    } catch (error) {
      throw new BadRequestException(error.message || 'Error during booking');
    }
  }
}