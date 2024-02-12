import request from 'supertest';
import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import { createTenant, isJwt } from '../utils';
import createJWKSMock from 'mock-jwks';
import { response } from 'express';
import { Tenant } from '../../src/entity/Tenant';

describe('POST  /users/', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
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
    it('should persist the user in the database', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));
      const adminToken = jwks.token({
        sub: '1',
        role: Roles.ADMIN,
      });

      // Register user
      const userData = {
        firstName: 'Rakesh',
        lastName: 'K',
        email: 'rakesh@mern.space',
        password: 'password',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      // Add token to cookie
      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });
    it('should create a manager user', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const adminToken = jwks.token({ sub: '1', role: Roles.ADMIN });

      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0].role).toBe(Roles.MANAGER);
    });
    it('should return 403 if non admin user tries to create a user', async () => {
      const managerToken = jwks.token({
        sub: '1',
        role: Roles.MANAGER,
      });

      // Register user
      const userData = {
        firstName: 'Rakesh',
        lastName: 'K',
        email: 'rakesh@mern.space',
        password: 'password',
        tenantId: 1,
      };

      // Add token to cookie
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${managerToken}`])
        .send(userData);
      expect(response.statusCode).toBe(403);
    });

    it('should list all the user ', async () => {
      const adminToken = jwks.token({ sub: '1', role: Roles.ADMIN });
      const userData = [
        {
          firstName: 'Vaibhav',
          lastName: 'Tiwari',
          email: 'vishutiwari99@gmail.com',
          password: 'secret123',
          tenantId: 1,
          role: Roles.MANAGER,
        },
        {
          firstName: 'Shyam',
          lastName: 'Tiwari',
          email: 'shyam12@gmail.com',
          password: 'secret123',
          tenantId: 2,
          role: Roles.MANAGER,
        },
        {
          firstName: 'Ram',
          lastName: 'Tiwari',
          email: 'ram12@gmail.com',
          password: 'secret123',
          tenantId: 3,
          role: Roles.MANAGER,
        },
      ];

      const userRepository = connection.getRepository(User);
      await userRepository.save(userData);
      const users = await request(app)
        .get('/users')
        .set('Cookie', [`accessToken=${adminToken}`]);
      expect(users.body).toHaveLength(3);
    });
  });
});
