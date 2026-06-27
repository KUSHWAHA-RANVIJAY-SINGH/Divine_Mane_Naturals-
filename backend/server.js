require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Connect Database & Run Migration
connectDB().then(() => {
  migrateOrders();
});

// Migration helper for past orders
async function migrateOrders() {
  try {
    const Order = require('./models/Order');
    const Product = require('./models/Product');
    const orders = await Order.find({
      $or: [
        { totalAmount: { $exists: false } },
        { priceAtOrder: { $exists: false } }
      ]
    });
    if (orders.length > 0) {
      console.log(`🧹 Migrating ${orders.length} past orders to add priceAtOrder, discountAmount, and totalAmount...`);
      for (const order of orders) {
        let priceAtOrder = 0;
        const product = await Product.findOne({ name: order.productName });
        if (product) {
          priceAtOrder = product.price || 0;
        }
        const discountAmount = order.discountApplied || 0;
        const totalAmount = order.totalPrice !== null && order.totalPrice !== undefined
          ? order.totalPrice
          : Math.max(0, (priceAtOrder * order.quantity) - discountAmount);

        order.priceAtOrder = priceAtOrder;
        order.discountAmount = discountAmount;
        order.totalAmount = totalAmount;
        await order.save({ validateBeforeSave: false });
      }
      console.log('✅ Past orders migrated successfully.');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.get('/api/my-orders', require('./middleware/customerAuth'), require('./controllers/orderController').getCustomerOrders);
app.use('/api/coupons', couponRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Simple status route
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Divine Mane Naturals API is running.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
