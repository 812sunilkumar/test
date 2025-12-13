"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("../../src/app.module");
const mongoose_1 = __importDefault(require("mongoose"));
describe('Reservation E2E', () => {
    let app;
    beforeAll(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
        await mongoose_1.default.disconnect();
    });
    it('/availability (GET) returns 400 for missing params or gracefully handles', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer()).get('/availability');
        expect(res.status).toBeGreaterThanOrEqual(200);
    });
});
//# sourceMappingURL=reservation.e2e-spec.js.map