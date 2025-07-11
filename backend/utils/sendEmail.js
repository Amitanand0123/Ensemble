import nodemailer from 'nodemailer';

let transporter = null;

const sendEmail = async (options) => {
    try {
        if (!transporter) {
            if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
                throw new Error('Gmail credentials are missing. Please set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file');
            }

            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD, // App password, not regular password
                },
            });

            await transporter.verify();
            console.log('Gmail SMTP connection verified successfully');
        }
        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'Your App'}" <${process.env.GMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || `<p>${options.message}</p>`,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        
        return {
            success: true,
            messageId: info.messageId,
            response: info.response
        };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent: ' + error.message);
    }
};

export default sendEmail;