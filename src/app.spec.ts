import app from './app';
import { calculateDiscount } from './util';
import request from 'supertest';
describe('App', () => {
  it('should calculate discount', () => {
    const result = calculateDiscount(100, 10);
    expect(result).toBe(10);
  });

  it('should return 200 status', async () => {
    const response = await request(app).get('/').send();
    expect(response.statusCode).toBe(200);
  });
});
