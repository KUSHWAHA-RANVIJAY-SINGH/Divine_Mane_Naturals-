const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Auth Endpoints', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should authenticate admin with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@divinemanenaturals.com',
        password: 'changeme123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.admin.email).toEqual('admin@divinemanenaturals.com');
  });

  it('should reject authentication with incorrect credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@divinemanenaturals.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message');
  });
});
