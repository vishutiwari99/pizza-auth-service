import request from 'supertest';
import { DataSource } from 'typeorm';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import { isJwt } from '../utils';

describe('POST  /auth/login', () => {
  let connection: DataSource;
  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // Database truncate
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('Given all fields', () => {
    it('should return accessToken and refreshToken', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });
      const user = {
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };

      // Act
      const response = await request(app).post('/auth/login').send(user);
      let accessToken: null | string = null;
      let refreshToken: null | string = null;
      interface Headers {
        ['set-cookie']: string[];
      }
      const cookies =
        (response.headers as unknown as Headers)['set-cookie'] || [];
      // accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjkzOTA5Mjc2LCJleHAiOjE2OTM5MDkzMzYsImlzcyI6Im1lcm5zcGFjZSJ9.KetQMEzY36vxhO6WKwSR-P_feRU1yI-nJtp6RhCEZQTPlQlmVsNTP7mO-qfCdBr0gszxHi9Jd1mqf-hGhfiK8BRA_Zy2CH9xpPTBud_luqLMvfPiz3gYR24jPjDxfZJscdhE_AIL6Uv2fxCKvLba17X0WbefJSy4rtx3ZyLkbnnbelIqu5J5_7lz4aIkHjt-rb_sBaoQ0l8wE5KzyDNy7mGUf7cI_yR8D8VlO7x9llbhvCHF8ts6YSBRBt_e2Mjg5txtfBaDq5auCTXQ2lmnJtMb75t1nAFu8KwQPrDYmwtGZDkHUcpQhlP7R-y3H99YnrWpXbP8Zr_oO67hWnoCSw; Max-Age=43200; Domain=localhost; Path=/; Expires=Tue, 05 Sep 2023 22:21:16 GMT; HttpOnly; SameSite=Strict
      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.split(';')[0].split('=')[1];
        }

        if (cookie.startsWith('refreshToken=')) {
          refreshToken = cookie.split(';')[0].split('=')[1];
        }
      });
      // Assert
      expect(response.statusCode).toBe(200);
      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();
      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });

    it('should return the 400 if email or password is incorrect', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });
      const user = {
        email: 'vishutiwari99@gmail.com',
        password: 'secret12312',
      };

      // Act
      const response = await request(app).post('/auth/login').send(user);

      expect(response.statusCode).toBe(400);
    });
  });
  describe('Fields are missing', () => {
    it('Should return 400 status code if email is missing', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });
      const user = {
        email: 'vishutiwari99@gmail.com',
        password: '',
      };

      // Act
      const response = await request(app).post('/auth/login').send(user);
      expect(response.statusCode).toBe(400);
    });
  });
});
