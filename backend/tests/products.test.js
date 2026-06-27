const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Products Endpoints', () => {
  let token;
  let createdProductId;

  beforeAll(async () => {
    // Admin login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@divinemanenaturals.com',
        password: 'changeme123',
      });
    token = res.body.token;
  });

  afterAll(async () => {
    // Delete the test product
    if (createdProductId && token) {
      await request(app)
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${token}`);
    }
    await mongoose.connection.close();
  });

  it('should retrieve list of products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should reject product creation without authorization token', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        name: 'Test Product Jest Non-Auth',
        category: 'Cleanse',
        benefit: 'Cleanses hair',
        price: 120.00,
      });

    expect(res.statusCode).toEqual(401);
  });

  it('should create a new product when authorized as admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Product Jest Auth',
        category: 'Cleanse',
        benefit: 'Cleanses hair thoroughly',
        price: '145.50',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toEqual('Test Product Jest Auth');
    expect(res.body.price).toEqual(145.5);
    createdProductId = res.body._id;
  });
});
