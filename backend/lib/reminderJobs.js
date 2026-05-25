const { Prisma } = require('@prisma/client');
const prisma = require('./prisma');
const mailer = require('./mailer');

// ---------------------------------------------------------------------------
// Reminder jobs — the actual work the scheduler triggers. Each job matches on
// the EXACT day (unlike the panel's 30-day window in routes/employee.js) and
// records what it sent in `sent_reminders` so a restart or manual re-run never
// double-emails HR.
// ---------------------------------------------------------------------------

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

function isoDay(date) {
    return new Date(date).toISOString().split('T')[0];
}

function sameMonthDay(a, b) {
    return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Reserve a dedup key before sending. Returns true if this is the first claim
// (caller should send), false if it was already sent. Atomic via the unique
// constraint on dedup_key.
async function claim(dedupKey, type) {
    try {
        await prisma.sentReminder.create({ data: { dedup_key: dedupKey, type } });
        return true;
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return false;
        throw e;
    }
}

async function releaseClaim(dedupKey) {
    try {
        await prisma.sentReminder.delete({ where: { dedup_key: dedupKey } });
    } catch (e) {
        console.error('Failed to release reminder claim:', e.message);
    }
}

// Send wrapper that respects dedup unless `force` is set. On send failure the
// claim is released so the next run can retry.
async function dispatch({ dedupKey, type, force, sendFn, summary, label }) {
    if (!force) {
        const ok = await claim(dedupKey, type);
        if (!ok) {
            summary.skipped.push(label);
            return;
        }
    }
    try {
        await sendFn();
        summary.sent.push(label);
    } catch (e) {
        console.error(`Failed to send ${type} (${label}):`, e.message);
        summary.errors.push(`${label}: ${e.message}`);
        if (!force) await releaseClaim(dedupKey);
    }
}

// Daily 09:00 job: birthdays today, last working days today, 3-month milestones today.
async function runDailyReminders({ force = false } = {}) {
    const today = startOfToday();
    const day = isoDay(today);
    const summary = { job: 'daily', date: day, sent: [], skipped: [], errors: [] };

    const activeEmployees = await prisma.employee.findMany({
        where: { employment_status: 'active' },
        select: { employee_id: true, full_name: true, date_of_birth: true, date_of_joining: true },
    });

    // 1. Birthdays today — single digest to HR.
    const birthdayPeople = activeEmployees.filter(
        (e) => e.date_of_birth && sameMonthDay(new Date(e.date_of_birth), today),
    );
    if (birthdayPeople.length > 0) {
        await dispatch({
            dedupKey: `birthday_daily:${day}`,
            type: 'birthday_daily',
            force,
            sendFn: () => mailer.sendBirthdayTodayEmail({ employees: birthdayPeople }),
            summary,
            label: `birthday_daily digest (${birthdayPeople.length})`,
        });
    }

    // 2. Three-month milestone today — DOJ + 3 calendar months === today.
    const milestonePeople = activeEmployees.filter((e) => {
        if (!e.date_of_joining) return false;
        const doj = new Date(e.date_of_joining);
        const milestone = new Date(doj.getFullYear(), doj.getMonth() + 3, doj.getDate());
        return sameMonthDay(milestone, today) && milestone.getFullYear() === today.getFullYear();
    });
    for (const emp of milestonePeople) {
        await dispatch({
            dedupKey: `three_month_milestone:${emp.employee_id}:${day}`,
            type: 'three_month_milestone',
            force,
            sendFn: () => mailer.sendThreeMonthMilestoneEmail({ employee: emp }),
            summary,
            label: `three_month_milestone ${emp.employee_id}`,
        });
    }

    // 3. Last working day today.
    const startOfTomorrow = new Date(today);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const exits = await prisma.exitDetails.findMany({
        where: { last_working_day: { gte: today, lt: startOfTomorrow } },
        include: { employee: { select: { employee_id: true, full_name: true } } },
    });
    for (const exit of exits) {
        await dispatch({
            dedupKey: `last_working_day:${exit.employee.employee_id}:${day}`,
            type: 'last_working_day',
            force,
            sendFn: () => mailer.sendLastWorkingDayEmail({ employee: exit.employee }),
            summary,
            label: `last_working_day ${exit.employee.employee_id}`,
        });
    }

    return summary;
}

// Monthly (1st, 09:00) job: digest of everyone with a birthday this month.
async function runMonthlyBirthdayDigest({ force = false } = {}) {
    const today = startOfToday();
    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const summary = { job: 'monthly', month: monthKey, sent: [], skipped: [], errors: [] };

    const activeEmployees = await prisma.employee.findMany({
        where: { employment_status: 'active' },
        select: { employee_id: true, full_name: true, date_of_birth: true },
    });

    const people = activeEmployees
        .filter((e) => e.date_of_birth && new Date(e.date_of_birth).getMonth() === today.getMonth())
        .sort((a, b) => new Date(a.date_of_birth).getDate() - new Date(b.date_of_birth).getDate());

    if (people.length > 0) {
        await dispatch({
            dedupKey: `birthday_monthly:${monthKey}`,
            type: 'birthday_monthly',
            force,
            sendFn: () => mailer.sendMonthlyBirthdayEmail({ employees: people, monthName: MONTH_NAMES[today.getMonth()] }),
            summary,
            label: `birthday_monthly digest (${people.length})`,
        });
    }

    return summary;
}

module.exports = { runDailyReminders, runMonthlyBirthdayDigest };
