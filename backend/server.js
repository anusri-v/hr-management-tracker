require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const prisma = require('./lib/prisma'); 
const authRouter = require('./routes/auth');
const employeeRouter = require('./routes/employee');
const userRouter = require('./routes/user');
const activityLogRouter = require('./routes/activityLog');
const requireAuth = require('./middleware/requireAuth');
const { startScheduler } = require('./lib/scheduler');

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: corsOrigins,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/employee', employeeRouter);
app.use('/users', userRouter);
app.use('/activity-log', activityLogRouter);

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

startScheduler();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
});
