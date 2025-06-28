import { Resend } from 'resend';

const apikey=process.env.RESEND_API_KEY
if (!apikey) {
    console.error("❌ RESEND_API_KEY is missing from environment variables");
    console.error("Please add RESEND_API_KEY=re_your_key_here to your .env file");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    if (!process.env.RESEND_API_KEY) {
        console.error("Resend API Key is missing. Cannot send email.");
        throw new Error("Email service is not configured.");
    }
    try {
        const data = await resend.emails.send({
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            html: options.html || `<p>${options.message}</p>`,
        });
        console.log('Email sent successfully via Resend:', data);
        return data;
    } catch (error) {
        console.error('Detailed Resend email sending error:', error);
        throw error;
    }
};

export default sendEmail;