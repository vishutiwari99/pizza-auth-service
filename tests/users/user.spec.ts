import request from 'supertest';
import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import { isJwt } from '../utils';
import createJWKSMock from 'mock-jwks';
import { response } from 'express';

describe('GET  /auth/self', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5501');
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    // Database truncate
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(async () => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('Given all fields', () => {
    it('should return the 200 status code', async () => {
      const accessToken = jwks.token({ sub: '1', role: Roles.CUSTOMER });

      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();
      expect(response.statusCode).toBe(200);
    });
    it('should return the user data', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      const accessToken = jwks.token({ sub: String(data.id), role: data.role });

      // Register the user
      //
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();
      expect(response.body.id).toBe(data.id);
    });
    it('should return 401 status code if token does not exist', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      const response = await request(app).get('/auth/self').send();
      expect(response.statusCode).toBe(401);
    });
  });
});
