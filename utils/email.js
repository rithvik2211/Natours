const nodemailer = require('nodemailer');

const send_email = async options => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mail_optns = {
        from: 'ADMIN admin@gmail.com',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transport.sendMail(mail_optns);
}

module.exports = send_email;
