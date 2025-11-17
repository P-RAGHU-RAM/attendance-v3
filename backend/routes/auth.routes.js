const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Otp = require('../models/otp.model');
const { sendOTP } = require('../services/sms.service');

/**
 * POST /api/auth/send-otp
 * Takes { phoneNumber }
 * Checks if User exists, generates OTP, saves it, and sends via SMS
 */
router.post('/send-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Check if user exists
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Calculate expiration time (5 minutes from now)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Save OTP to database
        await Otp.create({
            phoneNumber,
            otp,
            expiresAt
        });

        // Send OTP via SMS
        await sendOTP(phoneNumber, otp);

        return res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP error:', error);
        return res.status(500).json({ error: 'Failed to send OTP' });
    }
});

/**
 * POST /api/auth/verify-otp
 * Takes { phoneNumber, otp }
 * Verifies OTP, creates JWT token
 */
router.post('/verify-otp', async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({ error: 'Phone number and OTP are required' });
        }

        // Find OTP in database
        const otpRecord = await Otp.findOne({ phoneNumber, otp });

        // Check if OTP exists and is not expired
        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        // Find user
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Delete OTP after verification (optional but recommended)
        await Otp.deleteOne({ _id: otpRecord._id });

        return res.status(200).json({
            message: 'OTP verified successfully',
            token,
            user: {
                userId: user._id,
                phoneNumber: user.phoneNumber,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

module.exports = router;
