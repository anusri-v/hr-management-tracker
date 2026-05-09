const express = require('express');

const router = express.Router();
const prisma = require('../lib/prisma');
const requireAuth = require('../middleware/requireAuth');
const { USER_STATUS } = require('../constants/userStatus');

// Valid status transitions
const ALLOWED_TRANSITIONS = {
    [USER_STATUS.PENDING]: [USER_STATUS.ACTIVE],
    [USER_STATUS.ACTIVE]:  [USER_STATUS.REVOKED],
    [USER_STATUS.REVOKED]: [USER_STATUS.ACTIVE],
};

// GET /users?status=0|1|2
router.get('/', requireAuth, async (req, res) => {
    try {
        const { status } = req.query;
        const where = status !== undefined ? { status: Number(status) } : {};

        const [users, count] = await Promise.all([
            prisma.user.findMany({ where, orderBy: { created_at: 'desc' } }),
            prisma.user.count({ where }),
        ]);

        res.json({ users, count });
    } catch (e) {
        console.error('GET /users failed:', e.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// PATCH /users/:id/status  — body: { status: number }
router.patch('/:id/status', requireAuth, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const newStatus = Number(req.body.status);

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const allowed = ALLOWED_TRANSITIONS[user.status] ?? [];
        if (!allowed.includes(newStatus)) {
            return res.status(422).json({
                error: 'Invalid status transition',
                detail: `Cannot move from status ${user.status} to ${newStatus}`,
            });
        }

        const updateData = { status: newStatus };
        if (newStatus === USER_STATUS.ACTIVE) {
            updateData.authorized_by = req.user.uid;
            updateData.authorized_at = new Date();
        } else if (newStatus === USER_STATUS.REVOKED) {
            updateData.revoked_by = req.user.uid;
            updateData.revoked_at = new Date();
        }

        const updated = await prisma.user.update({ where: { id }, data: updateData });
        res.json({ user: updated });
    } catch (e) {
        console.error('PATCH /users/:id/status failed:', e.message);
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

// POST /users/me/request-access  — revoked user requests re-activation (moves to pending)
router.post('/me/request-access', requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { google_sub: req.user.uid } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.status !== USER_STATUS.REVOKED) {
            return res.status(422).json({ error: 'Only revoked users can request access' });
        }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { status: USER_STATUS.PENDING },
        });
        res.json({ user: updated });
    } catch (e) {
        console.error('POST /users/me/request-access failed:', e.message);
        res.status(500).json({ error: 'Failed to request access' });
    }
});

module.exports = router;
