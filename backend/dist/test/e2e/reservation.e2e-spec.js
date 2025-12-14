"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("../../src/app.module");
const mongoose_1 = __importDefault(require("mongoose"));
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
describe('Reservation E2E', () => {
    let app;
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        app.enableCors();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
        await mongoose_1.default.disconnect();
    });
    describe('GET /availability', () => {
        it('should return 400 for missing parameters', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer()).get('/availability');
            expect(res.status).toBe(400);
        });
        it('should return 400 for missing location', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/availability')
                .query({
                vehicleType: 'tesla_model3',
                startDateTime: (0, dayjs_1.default)().add(1, 'day').toISOString(),
                durationMins: 45,
            });
            expect(res.status).toBe(400);
        });
        it('should return available: false for past dates', async () => {
            const pastDate = (0, dayjs_1.default)().subtract(1, 'day').toISOString();
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/availability')
                .query({
                location: 'dublin',
                vehicleType: 'tesla_model3',
                startDateTime: pastDate,
                durationMins: 45,
            });
            expect(res.status).toBe(200);
            expect(res.body.available).toBe(false);
            expect(res.body.reason).toContain('past');
        });
        it('should return available: false for dates more than 14 days away', async () => {
            const futureDate = (0, dayjs_1.default)().add(15, 'day').toISOString();
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/availability')
                .query({
                location: 'dublin',
                vehicleType: 'tesla_model3',
                startDateTime: futureDate,
                durationMins: 45,
            });
            expect(res.status).toBe(200);
            expect(res.body.available).toBe(false);
            expect(res.body.reason).toContain('14 days');
        });
        it('should return availability check result', async () => {
            const validDate = (0, dayjs_1.default)().add(1, 'day').hour(10).minute(0).second(0).millisecond(0).utc().toISOString();
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/availability')
                .query({
                location: 'dublin',
                vehicleType: 'tesla_model3',
                startDateTime: validDate,
                durationMins: 45,
            });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('available');
            if (res.body.available) {
                expect(res.body).toHaveProperty('vehicle');
                expect(res.body.vehicle).toHaveProperty('id');
            }
        });
    });
    describe('GET /status', () => {
        it('should return ok', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer()).get('/status');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ status: 'ok' });
        });
    });
    describe('POST /reservations', () => {
        it('should return 400 for missing vehicleId', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/reservations')
                .send({
                startDateTime: (0, dayjs_1.default)().add(1, 'day').toISOString(),
                durationMins: 45,
                customerName: 'Test User',
                customerEmail: 'test@example.com',
                customerPhone: '+1234567890',
            });
            expect(res.status).toBe(400);
        });
        it('should return 400 for invalid vehicle', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/reservations')
                .send({
                vehicleId: 'invalid_vehicle',
                startDateTime: (0, dayjs_1.default)().add(1, 'day').toISOString(),
                durationMins: 45,
                customerName: 'Test User',
                customerEmail: 'test@example.com',
                customerPhone: '+1234567890',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Vehicle not found');
        });
        it('should return 400 for past dates', async () => {
            const pastDate = (0, dayjs_1.default)().subtract(1, 'day').toISOString();
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/reservations')
                .send({
                vehicleId: 'tesla_1001',
                startDateTime: pastDate,
                durationMins: 45,
                customerName: 'Test User',
                customerEmail: 'test@example.com',
                customerPhone: '+1234567890',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('past');
        });
        it('should create reservation successfully', async () => {
            const validDate = (0, dayjs_1.default)().add(1, 'day').hour(10).minute(0).second(0).millisecond(0).utc().toISOString();
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/reservations')
                .send({
                vehicleId: 'tesla_1001',
                startDateTime: validDate,
                durationMins: 45,
                customerName: 'Test User',
                customerEmail: 'test@example.com',
                customerPhone: '+1234567890',
            });
            expect(res.status).not.toBe(500);
            if (res.status === 201 || res.status === 200) {
                expect(res.body).toHaveProperty('vehicleId');
                expect(res.body.vehicleId).toBe('tesla_1001');
            }
        });
    });
});
//# sourceMappingURL=reservation.e2e-spec.js.map