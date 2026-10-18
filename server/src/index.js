const express = require('express');
const cors = require('cors');

const ENV = require('./config/env');
const connectDB = require('./config/database');
const {notFound, errorHandler} = require('./middleware/error.middleware');
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const userRoutes = require('./routes/user.routes');
const paymentRoutes = require('./routes/payment.routes');
const contactRoutes = require('./routes/contact.routes');
const { handleWebhook } = require('./controllers/payment.controller');

const app = express();
const allowedOrigins = [ENV.FRONTEND_URL, ENV.ADMIN_URL];

app.use(cors({
    origin(origin, callback) {
        const isDevelopmentLocalOrigin = ENV.NODE_ENV !== 'production'
            && /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin || '');

        if (!origin || allowedOrigins.includes(origin) || isDevelopmentLocalOrigin) {
            callback(null, true);
            return;
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.post('/api/payments/webhook', express.raw({ type: 'application/json', limit: '1mb' }), handleWebhook);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);


// API HEALTH CHECK
app.use('/api/health', (req, res) => {
    res.status(200).json({
        message: 'API is running',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        status: 'OK'
    });
});

//error routes
app.use(notFound);
app.use(errorHandler);



// Connect to MongoDB
const startServer = async () => {
    try {
        const connection = await connectDB();
        if (connection.readyState === 1) {
            app.listen(ENV.PORT, () => {
                console.log(`Server is running on port ${ENV.PORT}`);
            });
        } else {
            console.error('MongoDB connection failed');
            process.exit(1);
        }
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        process.exit(1);
    }
};

startServer();
