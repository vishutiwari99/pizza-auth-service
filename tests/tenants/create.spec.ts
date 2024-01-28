import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { Tenant } from '../../src/entity/Tenant';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/constants';

describe('POST  /tenants', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5501');
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // Database truncate
    await connection.dropDatabase();
    await connection.synchronize();
    jwks.start();

    adminToken = jwks.token({ sub: '1', role: Roles.ADMIN });
  });

  afterAll(async () => {
    await connection.destroy();
  });

  afterEach(() => jwks.stop());

  describe('Given all fields', () => {
    it('should return a 201 status code', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Bilaspur Chhattisgarh',
      };
      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);
      expect(response.statusCode).toBe(201);
    });
    it('should create a tenant in database', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Bilaspur Chhattisgarh',
      };
      await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);
      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();
      expect(tenants).toHaveLength(1);
      expect(tenants[0].name).toBe('Tenant name');
    });
    it('should return 401 if user is not authenticated', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Bilaspur Chhattisgarh',
      };
      const response = await request(app).post('/tenants').send(tenantData);
      expect(response.statusCode).toBe(401);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      expect(tenants).toHaveLength(0);
    });
    it('should return 403 if user is not admin', async () => {
      const managerToken = jwks.token({ sub: '1', role: Roles.MANAGER });

      const tenantData = {
        name: 'Tenant name',
        address: 'Bilaspur Chhattisgarh',
      };
      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${managerToken}`])

        .send(tenantData);
      expect(response.statusCode).toBe(403);
      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();
      expect(tenants).toHaveLength(0);
    });

    it('should return 200', async () => {
      const response = await request(app)
        .get('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`]);
      expect(response.statusCode).toBe(200);
    });
    it('should return list of tenants', async () => {
      const tenantData = [
        {
          name: 'Tenant name',
          address: 'Bilaspur Chhattisgarh',
        },
        {
          name: 'Mausa JI',
          address: 'Bilaspur Chhattisgarh',
        },
      ];
      const tenantRepository = connection.getRepository(Tenant);
      await tenantRepository.save(tenantData);
      const response = await request(app)
        .get('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`]);
      expect(response.body).toHaveLength(2);
    });
  });
  describe('Fields are missing', () => {});
});
