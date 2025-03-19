import nodemailer from 'nodemailer';

// Create a transporter
const createTransporter = () => {
    // Check if email is explicitly disabled
    if (process.env.DISABLE_EMAIL === 'true') {
        console.info('Email sending is disabled via DISABLE_EMAIL environment variable.');
        return null;
    }

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('Email service is not configured properly. Emails will be logged but not sent.');
        return null;
    }

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
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email content in plain text (optional if html is provided)
 * @param {string} options.html - Email content in HTML format (optional if text is provided)
 * @returns {Promise} - Resolves with info about the sent email
 */
export const sendEmail = async (options) => {
    try {
        // Validate required parameters
        if (!options.to) {
            throw new Error('Recipient email address (to) is required');
        }
        if (!options.subject) {
            throw new Error('Email subject is required');
        }
        if (!options.text && !options.html) {
            throw new Error('Email content (text or html) is required');
        }

        const transporter = createTransporter();
        
        // If transporter is null, just log the email and return
        if (!transporter) {
            console.log('\n------- DEVELOPMENT MODE EMAIL -------');
            console.log(`To: ${options.to}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`Content: ${options.text || options.html?.substring(0, 150) + '...'}`);
            console.log('-------------------------------------\n');
            return { messageId: 'dev-mode', status: 'logged' };
        }
        
        // Verify transporter configuration
        await transporter.verify();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
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

    return sendEmail({
        to,
        subject,
        html
    });
}; 