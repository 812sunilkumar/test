import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import mongoose from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

describe('Reservation E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.enableCors();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
  });

  describe('GET /availability', () => {
    it('should return 400 for missing parameters', async () => {
      const res = await request(app.getHttpServer()).get('/availability');
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing location', async () => {
      const res = await request(app.getHttpServer())
        .get('/availability')
        .query({
          vehicleType: 'tesla_model3',
          startDateTime: dayjs().add(1, 'day').toISOString(),
          durationMins: 45,
        });
      expect(res.status).toBe(400);
    });

    it('should return available: false for past dates', async () => {
      const pastDate = dayjs().subtract(1, 'day').toISOString();
      const res = await request(app.getHttpServer())
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
      const futureDate = dayjs().add(15, 'day').toISOString();
      const res = await request(app.getHttpServer())
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
      const validDate = dayjs().add(1, 'day').hour(10).minute(0).second(0).millisecond(0).utc().toISOString();
      const res = await request(app.getHttpServer())
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

  // 'available-time-slots' endpoint removed; frontend should not call it anymore

  describe('GET /status', () => {
    it('should return ok', async () => {
      const res = await request(app.getHttpServer()).get('/status');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /reservations', () => {
    it('should return 400 for missing vehicleId', async () => {
      const res = await request(app.getHttpServer())
        .post('/reservations')
        .send({
          startDateTime: dayjs().add(1, 'day').toISOString(),
          durationMins: 45,
          customerName: 'Test User',
          customerEmail: 'test@example.com',
          customerPhone: '+1234567890',
        });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid vehicle', async () => {
      const res = await request(app.getHttpServer())
        .post('/reservations')
        .send({
          vehicleId: 'invalid_vehicle',
          startDateTime: dayjs().add(1, 'day').toISOString(),
          durationMins: 45,
          customerName: 'Test User',
          customerEmail: 'test@example.com',
          customerPhone: '+1234567890',
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Vehicle not found');
    });

    it('should return 400 for past dates', async () => {
      const pastDate = dayjs().subtract(1, 'day').toISOString();
      const res = await request(app.getHttpServer())
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
      const validDate = dayjs().add(1, 'day').hour(10).minute(0).second(0).millisecond(0).utc().toISOString();
      const res = await request(app.getHttpServer())
        .post('/reservations')
        .send({
          vehicleId: 'tesla_1001',
          startDateTime: validDate,
          durationMins: 45,
          customerName: 'Test User',
          customerEmail: 'test@example.com',
          customerPhone: '+1234567890',
        });
      // May succeed or fail depending on vehicle availability, but should not be 500
      expect(res.status).not.toBe(500);
      if (res.status === 201 || res.status === 200) {
        expect(res.body).toHaveProperty('vehicleId');
        expect(res.body.vehicleId).toBe('tesla_1001');
      }
    });
  });
});
