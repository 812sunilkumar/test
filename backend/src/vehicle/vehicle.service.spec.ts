import { Test, TestingModule } from '@nestjs/testing';
import { VehicleService } from './vehicle.service';
import { VehicleRepository } from './vehicle.repository';

describe('VehicleService', () => {
  let service: VehicleService;
  let vehicleRepo: jest.Mocked<VehicleRepository>;

  const mockVehicleRepo = {
    find: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        {
          provide: VehicleRepository,
          useValue: mockVehicleRepo,
        },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
    vehicleRepo = module.get(VehicleRepository);

    jest.clearAllMocks();
  });

  describe('listByTypeAndLocation', () => {
    it('should return vehicles filtered by type and location', async () => {
      const mockVehicles = [
        { id: 'v1', type: 'tesla_model3', location: 'dublin' },
        { id: 'v2', type: 'tesla_model3', location: 'dublin' },
      ];

      vehicleRepo.find.mockResolvedValue(mockVehicles as any);

      const result = await service.listByTypeAndLocation('tesla_model3', 'dublin');

      expect(result).toEqual(mockVehicles);
      expect(vehicleRepo.find).toHaveBeenCalledWith({
        type: 'tesla_model3',
        location: 'dublin',
      });
    });

    it('should handle case-insensitive type and location', async () => {
      const mockVehicles = [{ id: 'v1', type: 'tesla_model3', location: 'dublin' }];
      vehicleRepo.find.mockResolvedValue(mockVehicles as any);

      await service.listByTypeAndLocation('TESLA_MODEL3', 'DUBLIN');

      expect(vehicleRepo.find).toHaveBeenCalledWith({
        type: 'tesla_model3',
        location: 'dublin',
      });
    });
  });

  describe('listByLocation', () => {
    it('should return vehicles filtered by location', async () => {
      const mockVehicles = [
        { id: 'v1', type: 'tesla_model3', location: 'dublin' },
        { id: 'v2', type: 'tesla_modelx', location: 'dublin' },
      ];

      vehicleRepo.find.mockResolvedValue(mockVehicles as any);

      const result = await service.listByLocation('dublin');

      expect(result).toEqual(mockVehicles);
      expect(vehicleRepo.find).toHaveBeenCalledWith({
        location: 'dublin',
      });
    });
  });

  describe('findAllLocations', () => {
    it('should return unique sorted locations', async () => {
      const mockVehicles = [
        { location: 'cork' },
        { location: 'dublin' },
        { location: 'cork' },
        { location: 'galway' },
      ];

      vehicleRepo.find.mockResolvedValue(mockVehicles as any);

      const result = await service.findAllLocations();

      expect(result).toEqual(['cork', 'dublin', 'galway']);
    });

    it('should return empty array when no vehicles exist', async () => {
      vehicleRepo.find.mockResolvedValue([]);

      const result = await service.findAllLocations();

      expect(result).toEqual([]);
    });
  });

  describe('findAllVehicleTypes', () => {
    it('should return unique sorted vehicle types', async () => {
      const mockVehicles = [
        { type: 'tesla_model3' },
        { type: 'tesla_modelx' },
        { type: 'TESLA_MODEL3' },
      ];

      vehicleRepo.find.mockResolvedValue(mockVehicles as any);

      const result = await service.findAllVehicleTypes();

      expect(result).toEqual(['tesla_model3', 'tesla_modelx']);
    });

    it('should filter by location when provided', async () => {
      const mockVehicles = [{ type: 'tesla_model3' }];
      vehicleRepo.find.mockResolvedValue(mockVehicles as any);

      await service.findAllVehicleTypes('dublin');

      expect(vehicleRepo.find).toHaveBeenCalledWith({
        location: 'dublin',
      });
    });
  });

  describe('findById', () => {
    it('should return vehicle by id', async () => {
      const mockVehicle = { id: 'v1', type: 'tesla_model3', location: 'dublin' };
      vehicleRepo.findById.mockResolvedValue(mockVehicle as any);

      const result = await service.findById('v1');

      expect(result).toEqual(mockVehicle);
      expect(vehicleRepo.findById).toHaveBeenCalledWith('v1');
    });

    it('should return null when vehicle not found', async () => {
      vehicleRepo.findById.mockResolvedValue(null);

      const result = await service.findById('invalid');

      expect(result).toBeNull();
    });
  });
});
