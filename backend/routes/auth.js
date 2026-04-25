const { USER_STATUS } = require('../constants/userStatus');
const { ALLOWED_DOMAINS } = require('../constants/allowedDomains');

const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const prisma = require('../lib/prisma');

router.post('/google', async (req, res) => {
    const { credential } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { sub, email, email_verified, hd, name, picture } = ticket.getPayload();

        if (!email_verified) {
            return res.status(401).json({ error: 'Email not verified by Google' });
        }

        const domain = hd || email.split('@')[1]?.toLowerCase();
        if (!ALLOWED_DOMAINS.includes(domain)) {
            return res.status(403).json({
                error: 'Access restricted',
                detail: `Sign-in is limited to authorized domains. Your account (${email}) is not eligible.`,
            });
        }

        const user = await prisma.user.upsert({
            where: { google_sub: sub },
            update: { last_login_at: new Date() },
            create: {
                google_sub: sub, 
                email, 
                email_verified, 
                name, 
                picture,
                status: USER_STATUS.PENDING, 
                last_login_at: new Date(),
            }
        })

        const session = jwt.sign({ uid: sub, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res
            .cookie('session', session, { httpOnly: true, sameSite: 'lax', secure: false })
            .json({ user: { email, name, picture } });
    } catch (e) {
        console.error('verifyIdToken failed:', e.message);
        res.status(401).json({ error: 'Invalid Google token', detail: e.message });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('session').json({ ok: true });
});

module.exports = router;
