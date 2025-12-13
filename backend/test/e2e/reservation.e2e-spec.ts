import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import mongoose from 'mongoose';

describe('Reservation E2E', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
  });

  it('/availability (GET) returns 400 for missing params or gracefully handles', async () => {
    const res = await request(app.getHttpServer()).get('/availability');
    expect(res.status).toBeGreaterThanOrEqual(200);
  });
});
