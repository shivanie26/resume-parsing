const ContactMessage = require('../models/ContactMessage');
const { sendContactEmail, RECIPIENT_EMAIL } = require('../services/emailService');

/**
 * @route   POST /api/contact
 * @desc    Submit a contact inquiry message and send email notification to eshivani26@gmail.com
 * @access  Public
 */
const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name, email address, and inquiry message.'
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // 1. Save to MongoDB
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const contactRecord = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      recipient: RECIPIENT_EMAIL,
      ipAddress: clientIp
    });

    // 2. Dispatch Email via SMTP
    const emailResult = await sendContactEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim()
    });

    if (emailResult.sent) {
      contactRecord.emailSent = true;
      await contactRecord.save();
    }

    res.status(200).json({
      success: true,
      message: emailResult.sent
        ? `Thank you, ${name}! Your message has been sent directly to ${RECIPIENT_EMAIL}.`
        : `Thank you, ${name}! Your inquiry has been registered in the system for ${RECIPIENT_EMAIL}.`,
      emailSent: emailResult.sent,
      recipient: RECIPIENT_EMAIL,
      contactId: contactRecord._id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/contact/messages
 * @desc    Get all contact messages (Recruiter / Admin view)
 * @access  Private
 */
const getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      total: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactForm,
  getContactMessages
};
