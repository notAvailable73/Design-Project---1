import nodemailer from 'nodemailer';

// Create a transporter
const createTransporter = () => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    
    return transporter;
};

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email content in HTML format
 * @returns {Promise} - Resolves with info about the sent email
 */
export const sendEmail = async (to, subject, html) => {
    try {
        const transporter = createTransporter();
        
        // Verify transporter configuration
        await transporter.verify();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

/**
 * Send OTP verification email
 * @param {string} to - Recipient email
 * @param {string} otp - One-time password
 * @returns {Promise} - Resolves with info about the sent email
 */
export const sendOtpEmail = async (to, otp) => {
    const subject = 'Email Verification OTP';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">Email Verification</h2>
            <p style="color: #555; font-size: 16px;">Thank you for registering with our car rental service. Please use the following OTP to verify your email address:</p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${otp}
            </div>
            <p style="color: #555; font-size: 14px;">This OTP is valid for 2 minutes only.</p>
            <p style="color: #555; font-size: 14px;">If you didn't request this verification, please ignore this email.</p>
            <div style="text-align: center; margin-top: 30px; color: #888; font-size: 12px;">
                <p>© ${new Date().getFullYear()} Car Rental Service. All rights reserved.</p>
            </div>
        </div>
    `;

    return sendEmail(to, subject, html);
}; 