const Order = require('../models/Order');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { customerName, phone, productId, productName, quantity, notes, couponCode, discountApplied, totalPrice } = req.body;

    if (!customerName || !phone || !productName || !quantity) {
      return res.status(400).json({ message: 'Required fields missing: customerName, phone, productName, quantity' });
    }

    const order = await Order.create({
      customerName,
      phone,
      productId: productId || '',
      productName,
      quantity,
      notes: notes || '',
      couponCode: couponCode || '',
      discountApplied: discountApplied || 0,
      totalPrice: totalPrice !== undefined ? totalPrice : null,
    });

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

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
};
