import nodemailer from 'nodemailer';

const sendEmail = async (options)=>{
    try {
        let testAccount=await nodemailer.createTestAccount();

        const transporter=nodemailer.createTransport({
            host:process.env.SMTP_HOST || "smtp.ethereal.email",
            port:process.env.SMTP_PORT || 587,
            secure:false,
            auth:{
                user:process.env.SMTP_USER || testAccount.user,
                pass:process.env.SMTP_PASS || testAccount.pass
            }
        })

        const message={
            from:`${process.env.FROM_NAME}<${process.env.FROM_EMAIL}>`,
            to:options.email,
            subject:options.subject,
            text:options.message,
            html:options.html
        }

        const info = await transporter.sendMail(message);
        if(process.env.NODE_ENV==='development'){
            console.log('Preview URL: %s',nodemailer.getTestMessageUrl(info));
        }
        return info
    } catch (error) {
        console.error('Email sending failed: ',error);
        throw error;
    }
}

export default sendEmail; 