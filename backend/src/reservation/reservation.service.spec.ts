import { ReservationService } from './reservation.service';
import dayjs from 'dayjs';

const mockVehicleRepo: any = {
  findById: jest.fn(),
  find: jest.fn(),
};
const mockReservationRepo: any = {
  findConflicting: jest.fn(),
  create: jest.fn(),
};

describe('ReservationService', () => {
  let service: ReservationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReservationService(mockReservationRepo, mockVehicleRepo);
  });

  it('should throw if vehicle not found', async () => {
    mockVehicleRepo.findById.mockResolvedValue(null);
    await expect(service.schedule({
      vehicleId: 'v1',
      startDateTime: dayjs().toISOString(),
      durationMins: 30,
      customerName: 'a'
    })).rejects.toThrow();
  });

  it('should schedule successfully', async () => {
    mockVehicleRepo.findById.mockResolvedValue({
      id: 'v1',
      availableFromTime: '08:00',
      availableToTime: '18:00',
      availableDays: ['mon','tue','wed','thur','fri']
    });
    mockReservationRepo.findConflicting.mockResolvedValue(false);
    mockReservationRepo.create.mockImplementation((r)=>Promise.resolve({...r, _id:'abc'}));
    const start = dayjs().add(1,'day').hour(10).minute(0).second(0).toISOString();
    const res = await service.schedule({
      vehicleId: 'v1',
      startDateTime: start,
      durationMins: 30,
      customerName: 'Tester',
      customerEmail: 'a@b.com',
      customerPhone: '123'
    });
    expect(res).toBeDefined();
    expect(mockReservationRepo.create).toHaveBeenCalled();
  });
});
