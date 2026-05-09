const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const requireAuth = require('../middleware/requireAuth');

router.get('/', requireAuth, async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const per_page = Math.min(Math.max(parseInt(req.query.per_page, 10) || 20, 1), 100);
        const skip = (page - 1) * per_page;

        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                orderBy: { created_at: 'desc' },
                skip,
                take: per_page,
                include: { actor: { select: { id: true, name: true, email: true, picture: true } } },
            }),
            prisma.activityLog.count(),
        ]);

        res.json({ success: true, logs, pagination: { page, per_page, total } });
    } catch (e) {
        console.error('GET /activity-log failed:', e.message);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});

module.exports = router;
