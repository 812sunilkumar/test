"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reservation_service_1 = require("./reservation.service");
const dayjs_1 = __importDefault(require("dayjs"));
const mockVehicleRepo = {
    findById: jest.fn(),
    find: jest.fn(),
};
const mockReservationRepo = {
    findConflicting: jest.fn(),
    create: jest.fn(),
};
describe('ReservationService', () => {
    let service;
    beforeEach(() => {
        jest.clearAllMocks();
        service = new reservation_service_1.ReservationService(mockReservationRepo, mockVehicleRepo);
    });
    it('should throw if vehicle not found', async () => {
        mockVehicleRepo.findById.mockResolvedValue(null);
        await expect(service.schedule({
            vehicleId: 'v1',
            startDateTime: (0, dayjs_1.default)().toISOString(),
            durationMins: 30,
            customerName: 'a'
        })).rejects.toThrow();
    });
    it('should schedule successfully', async () => {
        mockVehicleRepo.findById.mockResolvedValue({
            id: 'v1',
            availableFromTime: '08:00',
            availableToTime: '18:00',
            availableDays: ['mon', 'tue', 'wed', 'thur', 'fri']
        });
        mockReservationRepo.findConflicting.mockResolvedValue(false);
        mockReservationRepo.create.mockImplementation((r) => Promise.resolve(Object.assign(Object.assign({}, r), { _id: 'abc' })));
        const start = (0, dayjs_1.default)().add(1, 'day').hour(10).minute(0).second(0).toISOString();
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
//# sourceMappingURL=reservation.service.spec.js.map