const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true
    },
    recipient: {
      type: String,
      default: 'eshivani26@gmail.com'
    },
    emailSent: {
      type: Boolean,
      default: false
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
