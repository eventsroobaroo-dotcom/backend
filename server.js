// =============================================
// MAIN SERVER FILE (server.js) - MongoDB Version
// =============================================
// This is your main backend server that connects to MongoDB Atlas (FREE)

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();


const registerRoutes = require('./routes/register');

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;

// =============================================
// DATABASE CONNECTION (MongoDB Atlas - FREE)
// =============================================
const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://amang7788123_db_user:40LYicXKlERZAdBb@cluster0.rspec3t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Connect to MongoDB
connectDB();

// =============================================
// SECURITY & MIDDLEWARE SETUP
// =============================================

// Security headers
app.use(helmet());

// Rate limiting - prevents spam
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS setup - allows your frontend to communicate with backend
const corsOptions = {
    origin: process.env.FRONTEND_URL || [
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'https://eventsroobaroo-dotcom.github.io/ROOBAROOO/',
        'http://localhost:8080'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: false
};
app.use(cors(corsOptions));

// Parse JSON requests
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded data (form submissions)
app.use(express.urlencoded({ extended: true }));

// =============================================
// API ROUTES
// =============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'ROOBAROO MongoDB Backend is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Registration routes
app.use('/api', registerRoutes);

// =============================================
// ERROR HANDLING
// =============================================

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found. Available endpoints: GET /api/health, POST /api/register'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// =============================================
// START SERVER
// =============================================
app.listen(PORT, () => {
    console.log(`🚀 ROOBAROO Backend server is running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📝 Register endpoint: http://localhost:${PORT}/api/register`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
    });
});
