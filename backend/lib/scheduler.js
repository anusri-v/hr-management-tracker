const cron = require('node-cron');
const { runDailyReminders, runMonthlyBirthdayDigest } = require('./reminderJobs');

const TZ = process.env.REMINDER_CRON_TZ || 'Asia/Kolkata';

async function runJob(name, fn) {
    try {
        const summary = await fn({});
        console.log(`[scheduler] ${name} ran:`, JSON.stringify(summary));
    } catch (e) {
        console.error(`[scheduler] ${name} failed:`, e.message);
    }
}

function startScheduler() {
    // Daily at 09:00 — birthdays today, last working days, 3-month milestones.
    cron.schedule('0 9 * * *', () => runJob('daily reminders', runDailyReminders), { timezone: TZ });
    // 1st of every month at 09:00 — monthly birthday digest.
    cron.schedule('0 9 1 * *', () => runJob('monthly birthday digest', runMonthlyBirthdayDigest), { timezone: TZ });
    console.log(`Reminder scheduler started (timezone: ${TZ})`);
}

module.exports = { startScheduler };
