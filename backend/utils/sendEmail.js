import nodemailer from 'nodemailer';

const sendEmail = async (options)=>{
    try {
        // console.log('Attempting to send email with options:', {
        //     to: options.email,
        //     subject: options.subject
        // });
        
        // console.log('Using SMTP config:', {
        //     host: process.env.SMTP_HOST,
        //     port: process.env.SMTP_PORT,
        //     user: process.env.SMTP_USER
        // });

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth:{
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const message = {
            from: `${process.env.FROM_NAME}<${process.env.FROM_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        // console.log('Sending email with message:', message);

        const info = await transporter.sendMail(message);
        // console.log('Email sent successfully:', info);
        
        return info;
    } catch (error) {
        console.error('Detailed email sending error:', error);
        throw error;
    }
}

export default sendEmail;