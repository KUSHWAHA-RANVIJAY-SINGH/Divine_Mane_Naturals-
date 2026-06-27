const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Analytics Endpoints', () => {
  let token;

  beforeAll(async () => {
    // Admin login to get JWT token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@divinemanenaturals.com',
        password: 'changeme123',
      });
    token = res.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should reject analytics fetch without auth token', async () => {
    const res = await request(app).get('/api/admin/analytics');
    expect(res.statusCode).toEqual(401);
  });

  it('should fetch analytics metrics successfully with valid admin token', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('revenueOverTime');
    expect(res.body).toHaveProperty('orderTrend');
    expect(res.body).toHaveProperty('ordersByStatus');
    expect(res.body).toHaveProperty('topProducts');
    expect(res.body).toHaveProperty('couponUsage');

    expect(Array.isArray(res.body.revenueOverTime)).toBe(true);
    expect(Array.isArray(res.body.orderTrend)).toBe(true);
    expect(Array.isArray(res.body.ordersByStatus)).toBe(true);
    expect(Array.isArray(res.body.topProducts)).toBe(true);
    expect(Array.isArray(res.body.couponUsage)).toBe(true);
  });
});
