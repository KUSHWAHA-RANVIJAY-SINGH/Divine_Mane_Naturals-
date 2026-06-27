const Coupon = require('../models/Coupon');

// @desc    Apply a coupon (Validate)
// @route   POST /api/coupons/apply
// @access  Public
const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code.' });
    }

    // Check expiration
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'Coupon code has expired.' });
    }

    // Check usage limit
    if (coupon.maxUsage !== null && coupon.maxUsage !== undefined && coupon.usedCount >= coupon.maxUsage) {
      return res.status(400).json({ message: 'Coupon has reached its maximum usage limit.' });
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Protected (admin)
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Protected (admin)
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate, maxUsage } = req.body;
    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ message: 'Required fields missing: code, discountType, discountValue' });
    }

    const uppercaseCode = code.toUpperCase();
    const existing = await Coupon.findOne({ code: uppercaseCode });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists.' });
    }

    const coupon = await Coupon.create({
      code: uppercaseCode,
      discountType,
      discountValue,
      expiryDate: expiryDate || null,
      maxUsage: maxUsage !== undefined && maxUsage !== '' && maxUsage !== null ? Number(maxUsage) : null,
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error('Create coupon error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Protected (admin)
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }
    await coupon.deleteOne();
    res.json({ message: 'Coupon deleted successfully.' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  applyCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
};
