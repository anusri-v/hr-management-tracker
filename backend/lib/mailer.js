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

// Recipients for all HR-facing notifications (access requests + reminders).
// HR_EMAIL may contain multiple comma-separated addresses.
const HR_RECIPIENTS = (process.env.HR_EMAIL || 'anusri.v@silq.net')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
// Base URL of the frontend, used in email links.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// Prepended to every email subject.
const SUBJECT_PREFIX = 'ShopUp - ';

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Single send path: applies the subject prefix and a consistent `from`.
// `to` accepts a string or an array of addresses (nodemailer handles both).
async function send({ to, subject, text }) {
    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject: `${SUBJECT_PREFIX}${subject}`,
        text,
    });
}

async function sendAccessRequestEmail({ userName, userEmail }) {
    await send({
        to: HR_RECIPIENTS,
        subject: 'New User Access Request in Employee Management',
        text: `A new user - ${userName} (${userEmail}) is requesting access to the employee management system. To approve click on this link: ${FRONTEND_URL}/user-access`,
    });
}

async function sendLastWorkingDayEmail({ employee }) {
    await send({
        to: HR_RECIPIENTS,
        subject: `Last Working Day Today - ${employee.full_name} (${employee.employee_id})`,
        text: `Today is the last working day for ${employee.full_name} (${employee.employee_id}). Please ensure exit formalities, no-dues, and the full & final settlement are on track.`,
    });
}

async function sendThreeMonthMilestoneEmail({ employee }) {
    await send({
        to: HR_RECIPIENTS,
        subject: `3-Month Milestone - ${employee.full_name} (${employee.employee_id})`,
        text: `${employee.full_name} (${employee.employee_id}) has completed 3 months since joining on ${formatDate(employee.date_of_joining)}. This may be a good time for a probation review.`,
    });
}

async function sendBirthdayTodayEmail({ employees }) {
    const lines = employees.map((e) => `- ${e.full_name} (${e.employee_id})`).join('\n');
    await send({
        to: HR_RECIPIENTS,
        subject: `Birthdays Today (${employees.length})`,
        text: `The following employee(s) are celebrating their birthday today:\n\n${lines}\n\nDo wish them a happy birthday!`,
    });
}

async function sendMonthlyBirthdayEmail({ employees, monthName }) {
    const lines = employees
        .map((e) => `- ${formatDate(e.date_of_birth).replace(/ \d{4}$/, '')}: ${e.full_name} (${e.employee_id})`)
        .join('\n');
    await send({
        to: HR_RECIPIENTS,
        subject: `Birthdays in ${monthName} (${employees.length})`,
        text: `The following employee(s) have birthdays in ${monthName}:\n\n${lines}`,
    });
}

async function sendAccessApprovedEmail({ userName, userEmail }) {
    await send({
        to: userEmail,
        subject: 'Your Access Has Been Approved - Employee Management',
        text: `Hi ${userName},\n\nYour access to the Employee Management System has been approved. You can now log in at ${FRONTEND_URL}.\n\nWelcome aboard!`,
    });
}

async function sendAccessRevokedEmail({ userName, userEmail }) {
    await send({
        to: userEmail,
        subject: 'Your Access Has Been Revoked - Employee Management',
        text: `Hi ${userName},\n\nYour access to the Employee Management System has been revoked. If you believe this is a mistake, please contact your administrator.`,
    });
}

module.exports = {
    sendAccessRequestEmail,
    sendAccessApprovedEmail,
    sendAccessRevokedEmail,
    sendLastWorkingDayEmail,
    sendThreeMonthMilestoneEmail,
    sendBirthdayTodayEmail,
    sendMonthlyBirthdayEmail,
};
