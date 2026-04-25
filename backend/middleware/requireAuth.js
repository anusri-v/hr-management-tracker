const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    try {
        req.user = jwt.verify(req.cookies.session, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Unauthenticated' });
    }
}

module.exports = requireAuth;
