const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Cleanse', 'Condition & Repair', 'Moisturize', 'Growth & Finish'],
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    benefit: {
      type: String,
      required: [true, 'Product benefit is required'],
      trim: true,
    },
    price: {
      type: Number,
      default: null,
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
    },
    imagePublicId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
