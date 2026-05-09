const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
});

async function sendAccessRequestEmail({ userName, userEmail }) {
    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: 'anusri.v@silq.net',
        subject: 'New User Access Request in Employee Management',
        text: `A new user - ${userName} (${userEmail}) is requesting access to the employee management system. To approve click on this link: http://localhost:5173/user-access`,
    });
}

module.exports = { sendAccessRequestEmail };
