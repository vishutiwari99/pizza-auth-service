import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { truncateTables } from '../utils';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
describe('POST  /auth/register', () => {
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
    it('should persist the user in the database', async () => {
      // Arrange
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };
      // Act
      const response = await request(app).post('/auth/register').send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
    });
    it('should return the 201 status code', async () => {
      // Arrange
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };
      // Act
      const response = await request(app).post('/auth/register').send(userData);

      // Assert
      expect(response.statusCode).toBe(201);
    });

    it('should return valid json response', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };
      // Act
      const response = await request(app).post('/auth/register').send(userData);
      // Assert application/json
      expect(
        (response.headers as Record<string, string>)['content-type'],
      ).toEqual(expect.stringContaining('json'));
    });

    it('should assign a customer role', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };
      // Act
      const response = await request(app).post('/auth/register').send(userData);
      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]).toHaveProperty('role');
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    it('should store the hashed password in the databases', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };
      // Act
      const response = await request(app).post('/auth/register').send(userData);
      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
    });

    it('should return 400 status code if email already exists', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...userData, role: Roles.CUSTOMER });
      // Act
      const response = await request(app).post('/auth/register').send(userData);
      const users = await userRepository.find();

      // Assert

      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });

    // it('should return an id of the current user', async () => {
    //   const userData = {
    //     firstName: 'Vishu',
    //     lastName: 'Tiwari',
    //     email: 'vishutiwari99@gmail.com',
    //     password: 'secret123',
    //   };
    //   // Act
    //   const response = await request(app).post('/auth/register').send(userData);
    //   // console.log('response', response.body);
    //   expect(response.body).toHaveProperty('id');
    //   const repository = connection.getRepository(User);
    //   const users = await repository.find();
    //   console.log('user', users);
    //   expect((response.body as Record<string, string>).id).toBe(users[0].id);
    // });
  });

  describe('Fields are missing', () => {
    it('Should return 400 status code if email is missing', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: '',
        password: 'secret123',
      };
      // Act
      const response = await request(app).post('/auth/register').send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it('should return 400 status code if firstName is missing', async () => {
      const userData = {
        firstName: '',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };
      // Act
      const response = await request(app).post('/auth/register').send(userData);
      expect(response.statusCode).toBe(400);
    });
    it('should return 400 status code if lastName is missing', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: '',
        email: 'vishutiwari99@gmail.com',
        password: 'secret123',
      };
      // Act
      const response = await request(app).post('/auth/register').send(userData);
      expect(response.statusCode).toBe(400);
    });
    it('should return 400 status code if password is missing', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: 'vishutiwari99@gmail.com',
        password: '',
      };
      // Act
      const response = await request(app).post('/auth/register').send(userData);
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Fields are not in proper format', () => {
    it('should trim the email field', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: ' vishutiwari99@gmail.com ',
        password: 'secret123',
      };
      await request(app).post('/auth/register').send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      const user = users[0];
      expect(user.email).toBe('vishutiwari99@gmail.com');
      // Act
    });

    it('should return 400 status code if email is not a valid email', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: ' vishutiwari99gmail.com ',
        password: 'secret123123',
      };
      const response = await request(app).post('/auth/register').send(userData);
      expect(response.statusCode).toBe(400);
    });
    it('should return 400 status code if password length is less than 8 characters', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: ' vishutiwari99gmail.com ',
        password: 'secret1',
      };
      const response = await request(app).post('/auth/register').send(userData);
      expect(response.statusCode).toBe(400);
    });
    it('should return an array of messages if email is missing', async () => {
      const userData = {
        firstName: 'Vaibhav',
        lastName: 'Tiwari',
        email: '  ',
        password: 'secret11231',
      };
      const response = await request(app).post('/auth/register').send(userData);
      expect(JSON.parse(response.text).errors[0].msg).toBe(
        'Email is required!',
      );
    });
  });
});
