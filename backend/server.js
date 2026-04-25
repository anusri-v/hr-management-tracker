require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const prisma = require('./lib/prisma'); 
const authRouter = require('./routes/auth');
const requireAuth = require('./middleware/requireAuth');

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);

app.get('/me', requireAuth, async (req, res) => {
    const userRecord = await prisma.user.findUnique({
        where: {
            email: req.user.email,
        }
    })

    if (!userRecord) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: userRecord });
});

app.listen(3000, () => {
    console.log('The server is running');
});
