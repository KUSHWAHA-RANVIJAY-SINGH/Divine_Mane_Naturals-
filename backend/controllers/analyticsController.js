const Order = require('../models/Order');

// @desc    Get sales and business analytics
// @route   GET /api/admin/analytics
// @access  Protected (admin)
const getAnalytics = async (req, res) => {
  try {
    const { range } = req.query;
    
    // Determine start date filter based on range parameter
    let startDate = null;
    const now = new Date();

    if (range === '7d') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '90d') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'all') {
      startDate = null; // No date filter, fetches all historical records
    } else {
      // Default to 30d
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};

    // 1. Revenue over time (only confirmed or fulfilled orders count towards business revenue)
    const revenueOverTime = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          status: { $in: ['confirmed', 'fulfilled'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: 1
        }
      }
    ]);

    // 2. Order trend (count of ALL orders placed over time)
    const orderTrend = await Order.aggregate([
      {
        $match: dateFilter
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          orderCount: 1
        }
      }
    ]);

    // 3. Orders status distribution (for Pie / Donut charts)
    const ordersByStatus = await Order.aggregate([
      {
        $match: dateFilter
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1
        }
      }
    ]);

    // 4. Top Selling Products (ordered by total revenue generation)
    const topProducts = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          status: { $in: ['confirmed', 'fulfilled'] }
        }
      },
      {
        $group: {
          _id: "$productId",
          productName: { $first: "$productName" },
          unitsSold: { $sum: "$quantity" },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 0,
          productName: 1,
          unitsSold: 1,
          revenue: 1
        }
      }
    ]);

    // 5. Coupon Performance (codes, times used, total savings provided)
    const couponUsage = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          couponCode: { $exists: true, $ne: "" }
        }
      },
      {
        $group: {
          _id: "$couponCode",
          timesUsed: { $sum: 1 },
          totalDiscountGiven: { $sum: "$discountAmount" }
        }
      },
      { $sort: { timesUsed: -1 } },
      {
        $project: {
          _id: 0,
          code: "$_id",
          timesUsed: 1,
          totalDiscountGiven: 1
        }
      }
    ]);

    res.json({
      revenueOverTime,
      orderTrend,
      ordersByStatus,
      topProducts,
      couponUsage
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving analytics data.' });
  }
};

module.exports = {
  getAnalytics,
};
