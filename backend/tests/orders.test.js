const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

describe('Orders Endpoints', () => {
  let testProduct;
  let validCoupon;
  let expiredCoupon;
  let maxedCoupon;
  let createdOrderIds = [];

  beforeAll(async () => {
    // 1. Get or create a product with a price to order
    testProduct = await Product.findOne({ price: { $gt: 0 } });
    if (!testProduct) {
      testProduct = await Product.create({
        name: 'Test Product for Orders Jest',
        category: 'Cleanse',
        benefit: 'Used for order placement test suite',
        price: 200.00,
      });
    }

    // 2. Create coupons for testing validation logic
    validCoupon = await Coupon.create({
      code: 'TESTVALIDJEST',
      discountType: 'fixed',
      discountValue: 20.00,
      isActive: true,
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    });

    expiredCoupon = await Coupon.create({
      code: 'TESTEXPIREDJEST',
      discountType: 'fixed',
      discountValue: 10.00,
      isActive: true,
      expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    });

    maxedCoupon = await Coupon.create({
      code: 'TESTMAXEDJEST',
      discountType: 'percent',
      discountValue: 15.00,
      isActive: true,
      maxUsage: 2,
      usedCount: 2, // hit limit
    });
  });

  afterAll(async () => {
    // Clean up created orders
    if (createdOrderIds.length > 0) {
      await Order.deleteMany({ _id: { $in: createdOrderIds } });
    }
    // Clean up test coupons
    await Coupon.deleteOne({ code: 'TESTVALIDJEST' });
    await Coupon.deleteOne({ code: 'TESTEXPIREDJEST' });
    await Coupon.deleteOne({ code: 'TESTMAXEDJEST' });
    
    await mongoose.connection.close();
  });

  it('should place an order and compute priceAtOrder and totalAmount securely from database values', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Jest Tester',
        phone: '0970000000',
        email: 'jest@test.com',
        productId: testProduct._id,
        productName: testProduct.name,
        quantity: 2,
        price: 9.99, // client attempt to tamper price
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.productName).toEqual(testProduct.name);
    
    // Server must use the actual database price instead of client 9.99
    expect(res.body.priceAtOrder).toEqual(testProduct.price);
    expect(res.body.totalAmount).toEqual(testProduct.price * 2);

    createdOrderIds.push(res.body._id);
  });

  it('should successfully place order with a valid coupon code and deduct correctly', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Jest Coupon Tester',
        phone: '0971111111',
        email: 'coupon@test.com',
        productId: testProduct._id,
        productName: testProduct.name,
        quantity: 1,
        couponCode: 'TESTVALIDJEST',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.couponCode).toEqual('TESTVALIDJEST');
    expect(res.body.discountAmount).toEqual(20.00);
    expect(res.body.totalAmount).toEqual(Math.max(0, testProduct.price - 20.00));

    createdOrderIds.push(res.body._id);
  });

  it('should reject order with an expired coupon code', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Jest Expired Coupon Tester',
        phone: '0972222222',
        email: 'expired@test.com',
        productId: testProduct._id,
        productName: testProduct.name,
        quantity: 1,
        couponCode: 'TESTEXPIREDJEST',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('expired');
  });

  it('should reject order with a coupon code that has reached its maximum usage limit', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Jest Maxed Coupon Tester',
        phone: '0973333333',
        email: 'maxed@test.com',
        productId: testProduct._id,
        productName: testProduct.name,
        quantity: 1,
        couponCode: 'TESTMAXEDJEST',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('maximum usage limit');
  });
});
