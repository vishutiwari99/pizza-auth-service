import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { Tenant } from '../../src/entity/Tenant';

describe('POST  /tenants', () => {
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
    it('should return a 201 status code', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Bilaspur Chhattisgarh',
      };
      const response = await request(app).post('/tenants').send(tenantData);
      expect(response.statusCode).toBe(201);
    });
    it('should create a tenant in database', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Bilaspur Chhattisgarh',
      };
      await request(app).post('/tenants').send(tenantData);
      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();
      expect(tenants).toHaveLength(1);
      expect(tenants[0].name).toBe('Tenant name');
    });
  });
  describe('Fields are missing', () => {});
});
