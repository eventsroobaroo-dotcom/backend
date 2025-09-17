// =============================================
// REGISTRATION ROUTES (routes/register.js) - MongoDB Version
// =============================================
// This file handles all registration-related API endpoints

const express = require('express');
const rateLimit = require('express-rate-limit');
const Registration = require('../models/Registration');

const router = express.Router();

// =============================================
// RATE LIMITING FOR REGISTRATION ENDPOINT
// =============================================
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 registration attempts per windowMs
    message: {
        success: false,
        error: 'Too many registration attempts. Please try again in 15 minutes.',
        code: 'RATE_LIMIT_EXCEEDED'
    }
});

// =============================================
// INPUT VALIDATION MIDDLEWARE
// =============================================
const validateRegistration = (req, res, next) => {
    const { name, email, phone, status } = req.body;
    const errors = [];

    // Check if all required fields are present
    if (!name) errors.push('Name is required');
    if (!email) errors.push('Email is required');
    if (!phone) errors.push('Phone number is required');
    if (!status) errors.push('Status is required');

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields',
            details: errors
        });
    }

    // Validate name
    if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push('Please provide a valid email address');
    }

    // Validate phone (10 digits only)
    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
        errors.push('Phone number must be exactly 10 digits');
    }

    // Validate status
    if (!['single', 'couple'].includes(status)) {
        errors.push('Status must be either "single" or "couple"');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }

    // Clean the data
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    req.body.phone = cleanPhone;
    req.body.status = status.toLowerCase();

    next();
};

// =============================================
// POST /api/register - Main Registration Endpoint
// =============================================
router.post('/register', registerLimiter, validateRegistration, async (req, res) => {
    try {
        const { name, email, phone, status } = req.body;

        console.log('📝 New registration request received:', {
            name,
            email: email.replace(/(.{3}).+(@.+)/, '$1***$2'), // Hide email for privacy
            status,
            timestamp: new Date().toISOString()
        });

        // Check if user already registered
        const existingUser = await Registration.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'This email is already registered for the event',
                code: 'DUPLICATE_EMAIL'
            });
        }

        // Create new registration
        const registration = new Registration({
            name,
            email,
            phone,
            status,
            ipAddress: req.ip
        });

        // Save to MongoDB
        const savedRegistration = await registration.save();

        console.log('✅ Registration saved successfully:', {
            id: savedRegistration._id,
            name: savedRegistration.name,
            email: savedRegistration.email.replace(/(.{3}).+(@.+)/, '$1***$2')
        });

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Registration submitted successfully! 🎉',
            data: {
                id: savedRegistration._id,
                name: savedRegistration.name,
                email: savedRegistration.email,
                status: savedRegistration.status,
                registrationDate: savedRegistration.registrationDate,
                submittedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Registration error:', error);

        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationErrors,
                code: 'VALIDATION_ERROR'
            });
        }

        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({
                success: false,
                error: 'This email is already registered for the event',
                code: 'DUPLICATE_EMAIL'
            });
        }

        // Generic error response
        res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again later.',
            code: 'INTERNAL_ERROR'
        });
    }
});

// =============================================
// GET /api/register - API Information Endpoint
// =============================================
router.get('/register', (req, res) => {
    res.json({
        message: 'ROOBAROO Registration API - MongoDB Version',
        method: 'POST',
        endpoint: '/api/register',
        requiredFields: ['name', 'email', 'phone', 'status'],
        statusOptions: ['single', 'couple'],
        example: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '9876543210',
            status: 'single'
        },
        database: 'MongoDB Atlas (FREE)',
        rateLimit: '5 requests per 15 minutes per IP'
    });
});

// =============================================
// GET /api/stats - Registration Statistics (Optional)
// =============================================
router.get('/stats', async (req, res) => {
    try {
        const totalRegistrations = await Registration.countDocuments();
        const singleCount = await Registration.countDocuments({ status: 'single' });
        const coupleCount = await Registration.countDocuments({ status: 'couple' });
        const todayCount = await Registration.countDocuments({
            registrationDate: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
        });

        res.json({
            success: true,
            stats: {
                totalRegistrations,
                singleRegistrations: singleCount,
                coupleRegistrations: coupleCount,
                todayRegistrations: todayCount,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('❌ Stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

// =============================================
// GET /api/test-db - Database Connection Test
// =============================================
router.get('/test-db', async (req, res) => {
    try {
        // Try to count documents to test connection
        const count = await Registration.countDocuments();
        
        res.json({
            success: true,
            message: 'MongoDB connection successful! 🎉',
            database: 'MongoDB Atlas',
            totalRegistrations: count,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Database test failed:', error);
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
            details: error.message,
            troubleshooting: [
                '1. Check MONGODB_URI in your .env file',
                '2. Verify your MongoDB Atlas cluster is running',
                '3. Check your network IP is whitelisted in MongoDB Atlas',
                '4. Ensure your database user has proper permissions'
            ]
        });
    }
});

module.exports = router;
