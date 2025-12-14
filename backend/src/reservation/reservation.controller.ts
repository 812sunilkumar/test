import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { ScheduleReservationDto } from './dto/schedule-reservation.dto';

@Controller()
export class ReservationController {
  constructor(private service: ReservationService) {}

  @Get('status')
  status() {
    return { status: 'ok' };
  }

  @Post('reservations')
  async create(@Body() body: ScheduleReservationDto) {
    return this.service.schedule(body);
  }

  @Get('availability')
  async availability(@Query() query: CheckAvailabilityDto) {
    try {
      const result = await this.service.checkAvailability(query.location, query.vehicleType, query.startDateTime, query.durationMins);
      return result;
    } catch (error) {
      throw new BadRequestException(error.message || 'Error checking availability');
    }
  }

  // Note: 'available-time-slots' endpoint removed; frontend shouldn't call it anymore.
}
