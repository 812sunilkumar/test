import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationRepository } from './reservation.repository';
import { VehicleRepository } from '../vehicle/vehicle.repository';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

describe('ReservationService', () => {
  let service: ReservationService;
  let reservationRepo: jest.Mocked<ReservationRepository>;
  let vehicleRepo: jest.Mocked<VehicleRepository>;

  const mockVehicleRepo = {
    find: jest.fn(),
    findById: jest.fn(),
  };

  const mockReservationRepo = {
    findConflicting: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: ReservationRepository,
          useValue: mockReservationRepo,
        },
        {
          provide: VehicleRepository,
          useValue: mockVehicleRepo,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    reservationRepo = module.get(ReservationRepository);
    vehicleRepo = module.get(VehicleRepository);

    jest.clearAllMocks();
  });

  describe('checkAvailability', () => {
    it('should return available: false for invalid date format', async () => {
      const result = await service.checkAvailability(
        'dublin',
        'tesla_model3',
        'invalid-date',
        45
      );
      expect(result.available).toBe(false);
      expect(result.reason).toContain('Invalid startDateTime format');
    });

    it('should return available: false for past dates', async () => {
      const pastDate = dayjs().subtract(1, 'day').toISOString();
      const result = await service.checkAvailability(
        'dublin',
        'tesla_model3',
        pastDate,
        45
      );
      expect(result.available).toBe(false);
      expect(result.reason).toContain('past');
    });

    it('should return available: false for dates more than 14 days away', async () => {
      // Date validation happens before vehicle lookup
      // Use a date that's definitely more than 14 days away
      const now = dayjs.utc();
      const futureDate = now.add(16, 'day').hour(10).minute(0).second(0).millisecond(0).toISOString();
      const result = await service.checkAvailability(
        'dublin',
        'tesla_model3',
        futureDate,
        45
      );
      expect(result.available).toBe(false);
      // The error message should mention "14 days" or "14 days in advance"
      expect(result.reason).toMatch(/14 days?/i);
    });

    it('should return available: false when no vehicles found', async () => {
      vehicleRepo.find.mockResolvedValue([]);
      const validDate = dayjs().add(1, 'day').hour(10).minute(0).toISOString();

      const result = await service.checkAvailability(
        'dublin',
        'tesla_model3',
        validDate,
        45
      );

      expect(result.available).toBe(false);
      expect(result.reason).toContain('No vehicles found');
    });

    it('should return available: false when vehicle not available on requested day', async () => {
      const vehicle = {
        id: 'v1',
        type: 'tesla_model3',
        location: 'dublin',
        availableDays: ['mon', 'tue', 'wed'],
        availableFromTime: '08:00',
        availableToTime: '18:00',
        minimumMinutesBetweenBookings: 0,
      };

      vehicleRepo.find.mockResolvedValue([vehicle]);
      reservationRepo.findConflicting.mockResolvedValue(false);
      // Request for Sunday (day 0) - vehicle only available Mon-Wed
      const sundayDate = dayjs().day(0).add(1, 'week').hour(10).minute(0).toISOString();

      const result = await service.checkAvailability(
        'dublin',
        'tesla_model3',
        sundayDate,
        45
      );

      expect(result.available).toBe(false);
      // The service loops through vehicles and returns generic message if none match
      expect(result.reason).toBe('No available vehicles for the selected time slot');
    });

    it('should return available: false when time outside availability window', async () => {
      const vehicle = {
        id: 'v1',
        type: 'tesla_model3',
        location: 'dublin',
        availableDays: ['mon', 'tue', 'wed'],
        availableFromTime: '08:00',
        availableToTime: '18:00',
        minimumMinutesBetweenBookings: 0,
      };

      vehicleRepo.find.mockResolvedValue([vehicle]);
      reservationRepo.findConflicting.mockResolvedValue(false);
      // Request for 7:00 AM (before availability window)
      const mondayDate = dayjs().day(1).add(1, 'week').hour(7).minute(0).toISOString();

      const result = await service.checkAvailability(
        'dublin',
        'tesla_model3',
        mondayDate,
        45
      );

      expect(result.available).toBe(false);
      // The service loops through vehicles and returns generic message if none match
      expect(result.reason).toBe('No available vehicles for the selected time slot');
    });

    it('should return available: false when there is a conflict', async () => {
      const vehicle = {
        id: 'v1',
        type: 'tesla_model3',
        location: 'dublin',
        availableDays: ['mon', 'tue', 'wed'],
        availableFromTime: '08:00',
        availableToTime: '18:00',
        minimumMinutesBetweenBookings: 0,
      };

      vehicleRepo.find.mockResolvedValue([vehicle]);
      reservationRepo.findConflicting.mockResolvedValue(true);

      const validDate = dayjs().day(1).add(1, 'week').hour(10).minute(0).toISOString();

      const result = await service.checkAvailability(
        'dublin',
        'tesla_model3',
        validDate,
        45
      );

      expect(result.available).toBe(false);
      // The service loops through vehicles and returns generic message if none match
      expect(result.reason).toBe('No available vehicles for the selected time slot');
    });

    it('should return available: true when vehicle is available', async () => {
      const vehicle = {
        id: 'v1',
        type: 'tesla_model3',
        location: 'dublin',
        availableDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        availableFromTime: '08:00',
        availableToTime: '18:00',
        minimumMinutesBetweenBookings: 0,
      };

      vehicleRepo.find.mockResolvedValue([vehicle]);
      reservationRepo.findConflicting.mockResolvedValue(false);

      // Use next Monday at 10:00 AM UTC
      const today = dayjs.utc();
      const daysUntilMonday = (1 - today.day() + 7) % 7 || 7;
      const nextMonday = today.add(daysUntilMonday, 'day').hour(10).minute(0).second(0).millisecond(0);
      const validDate = nextMonday.toISOString();

      const result = await service.checkAvailability(
        'dublin',
        'tesla_model3',
        validDate,
        45
      );

      expect(result.available).toBe(true);
      expect(result.vehicle).toEqual(vehicle);
    });
  });

  describe('checkAndBook', () => {
    it('should throw BadRequestException when vehicle is not available', async () => {
      vehicleRepo.find.mockResolvedValue([]);
      const validDate = dayjs().add(1, 'day').hour(10).minute(0).toISOString();

      await expect(
        service.checkAndBook(
          'dublin',
          'tesla_model3',
          validDate,
          45,
          'Test User',
          'test@example.com',
          '+1234567890'
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should create reservation when vehicle is available', async () => {
      const vehicle = {
        id: 'v1',
        type: 'tesla_model3',
        location: 'dublin',
        availableDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        availableFromTime: '08:00',
        availableToTime: '18:00',
        minimumMinutesBetweenBookings: 0,
      };

      vehicleRepo.find.mockResolvedValue([vehicle]);
      reservationRepo.findConflicting.mockResolvedValue(false);
      
      // Use a date that's definitely in the future, within 14 days, and at a valid time
      // Get tomorrow's date and set it to 10:00 AM UTC
      const tomorrow = dayjs.utc().add(1, 'day');
      const validDate = tomorrow.hour(10).minute(0).second(0).millisecond(0).toISOString();
      
      reservationRepo.create.mockResolvedValue({
        _id: 'res123',
        vehicleId: 'v1',
        startDateTime: validDate,
        endDateTime: dayjs.utc(validDate).add(45, 'minute').toISOString(),
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerPhone: '+1234567890',
      } as any);

      const result = await service.checkAndBook(
        'dublin',
        'tesla_model3',
        validDate,
        45,
        'Test User',
        'test@example.com',
        '+1234567890'
      );

      expect(result.available).toBe(true);
      expect(result.reservation).toBeDefined();
      expect((result.reservation as any)?._id).toBe('res123');
      expect(reservationRepo.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when reservation creation fails', async () => {
      const vehicle = {
        id: 'v1',
        type: 'tesla_model3',
        location: 'dublin',
        availableDays: ['mon', 'tue', 'wed'],
        availableFromTime: '08:00',
        availableToTime: '18:00',
        minimumMinutesBetweenBookings: 0,
      };

      vehicleRepo.find.mockResolvedValue([vehicle]);
      reservationRepo.findConflicting.mockResolvedValue(false);
      reservationRepo.create.mockRejectedValue(new Error('Database error'));

      const validDate = dayjs().day(1).add(1, 'week').hour(10).minute(0).toISOString();

      await expect(
        service.checkAndBook(
          'dublin',
          'tesla_model3',
          validDate,
          45,
          'Test User',
          'test@example.com',
          '+1234567890'
        )
      ).rejects.toThrow(BadRequestException);
    });
  });
});
