const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send OTP via SMS to the provided phone number
 * @param {string} phoneNumber - The phone number to send OTP to
 * @param {string} otp - The 6-digit OTP code
 * @returns {Promise} - Promise from Twilio API
 */
const sendOTP = async (phoneNumber, otp) => {
    try {
        const message = await client.messages.create({
            body: `Your Attendance System OTP is: ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        console.log(`OTP sent to ${phoneNumber}, message SID: ${message.sid}`);
        return message;
    } catch (error) {
        console.error(`Error sending OTP to ${phoneNumber}:`, error);
        throw error;
    }
};

module.exports = { sendOTP };
