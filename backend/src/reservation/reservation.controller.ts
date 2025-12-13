import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { ReservationService } from './reservation.service';

@Controller()
export class ReservationController {
  constructor(private service: ReservationService) {}

  @Post('reservations')
  async create(@Body() body: any) {
    return this.service.schedule(body);
  }

  @Get('availability')
  async availability(
    @Query('location') location: string, 
    @Query('vehicleType') vehicleType: string, 
    @Query('startDateTime') startDateTime: string, 
    @Query('durationMins') durationMins: string
  ) {
    if (!location || !vehicleType || !startDateTime || !durationMins) {
      throw new BadRequestException('Missing required parameters: location, vehicleType, startDateTime, durationMins');
    }
    
    const duration = Number(durationMins);
    if (isNaN(duration) || duration <= 0) {
      throw new BadRequestException('durationMins must be a positive number');
    }

    try {
      return await this.service.checkAvailability(location, vehicleType, startDateTime, duration);
    } catch (error) {
      throw new BadRequestException(error.message || 'Error checking availability');
    }
  }
}
