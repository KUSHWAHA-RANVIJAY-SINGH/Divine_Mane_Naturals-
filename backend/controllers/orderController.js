const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { customerName, phone, email, productId, productName, quantity, notes, couponCode, userId, customerId } = req.body;

    if (!customerName || !phone || !email || !productName || !quantity) {
      return res.status(400).json({ message: 'Required fields missing: customerName, phone, email, productName, quantity' });
    }

    // Resolve product price and canonical name from MongoDB to prevent client-side tampering
    let priceAtOrder = 0;
    let finalProductName = productName;

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      const product = await Product.findById(productId);
      if (product) {
        priceAtOrder = product.price || 0;
        finalProductName = product.name;
      }
    }

    // Resolve coupon discount securely on the backend
    let calculatedDiscountAmount = 0;
    let couponToUpdate = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon || !coupon.isActive) {
        return res.status(400).json({ message: 'Invalid or inactive coupon code.' });
      }

      // Check expiration
      if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
        return res.status(400).json({ message: 'Coupon code has expired.' });
      }

      // Check usage limits
      if (coupon.maxUsage !== null && coupon.maxUsage !== undefined && coupon.usedCount >= coupon.maxUsage) {
        return res.status(400).json({ message: 'Coupon has reached its maximum usage limit.' });
      }

      const basePrice = priceAtOrder * quantity;
      if (coupon.discountType === 'percent') {
        calculatedDiscountAmount = (basePrice * coupon.discountValue) / 100;
      } else if (coupon.discountType === 'fixed') {
        calculatedDiscountAmount = Math.min(basePrice, coupon.discountValue);
      }
      couponToUpdate = coupon;
    }

    const totalAmount = Math.max(0, (priceAtOrder * quantity) - calculatedDiscountAmount);

    // Auto-resolve customerId from email if not explicitly provided
    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId && email) {
      const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
      if (existingCustomer) {
        resolvedCustomerId = existingCustomer._id;
      }
    }

    const order = await Order.create({
      customerName,
      phone,
      email,
      productId: productId || '',
      productName: finalProductName,
      quantity,
      notes: notes || '',
      couponCode: couponCode || '',
      discountApplied: calculatedDiscountAmount,
      totalPrice: totalAmount, // For backward compatibility
      userId: userId || '',
      customerId: resolvedCustomerId || null,
      priceAtOrder,
      discountAmount: calculatedDiscountAmount,
      totalAmount,
    });

    if (couponCode && couponToUpdate) {
      couponToUpdate.usedCount += 1;
      await couponToUpdate.save();
    }

    // Send confirmation email asynchronously (does not block order response)
    sendOrderConfirmationEmail(order).catch(err => console.error('Error in sendOrderConfirmationEmail hook:', err));

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Protected (admin)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    // Sort: pending orders first, keeping others in createdAt desc order
    const sortedOrders = [...orders].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return 0;
    });

    res.json(sortedOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id
// @access  Protected (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'contacted', 'confirmed', 'fulfilled', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get order history for signed-in customer
// @route   GET /api/my-orders
// @access  Protected (customer)
const getCustomerOrders = async (req, res) => {
  try {
    // req.customer is attached by the customerAuth middleware
    const orders = await Order.find({ customerId: req.customer._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  getCustomerOrders,
};
