require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Admin = require('./models/Admin');
const Coupon = require('./models/Coupon');
const initialProducts = require('../src/data/products.json');

const seedDB = async () => {
  try {
    // Connect to Database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding.');

    // Seed Products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products.');

    const seededProducts = await Product.insertMany(initialProducts);
    console.log(`🎉 Seeded ${seededProducts.length} products successfully.`);

    // Seed Coupons
    await Coupon.deleteMany({});
    console.log('🗑️  Cleared existing coupons.');

    const initialCoupons = [
      { code: 'WELCOME10', discountType: 'percent', discountValue: 10, isActive: true },
      { code: 'DIVINE20', discountType: 'percent', discountValue: 20, isActive: true },
      { code: 'CHISAMBA50', discountType: 'fixed', discountValue: 50, isActive: true },
    ];
    const seededCoupons = await Coupon.insertMany(initialCoupons);
    console.log(`🎉 Seeded ${seededCoupons.length} coupons successfully.`);

    // Seed Admin
    const defaultEmail = 'admin@divinemanenaturals.com';
    const defaultPassword = 'changeme123';

    const existingAdmin = await Admin.findOne({ email: defaultEmail });
    if (!existingAdmin) {
      await Admin.create({
        email: defaultEmail,
        password: defaultPassword, // Will be hashed by mongoose pre-save hook
      });
      console.log(`👤 Default admin created:`);
      console.log(`   Email: ${defaultEmail}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log(`⚠️  PLEASE CHANGE THIS PASSWORD IMMEDIATELY UPON LOGGING IN.`);
    } else {
      console.log('👤 Admin user already exists. Skipping admin creation.');
    }

    console.log('✅ Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
