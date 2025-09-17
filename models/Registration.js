// =============================================
// REGISTRATION MODEL (models/Registration.js)
// =============================================
// This file defines how your registration data will be stored in MongoDB

const mongoose = require('mongoose');

// Create a schema (blueprint) for registration data
const registrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // Prevents duplicate emails
        trim: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please provide a valid email address'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits']
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: {
            values: ['single', 'couple'],
            message: 'Status must be either single or couple'
        }
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    // Store IP address for security/tracking
    ipAddress: {
        type: String
    }
}, {
    // Add automatic timestamps (createdAt, updatedAt)
    timestamps: true
});

// Create indexes for better performance
registrationSchema.index({ email: 1 });
registrationSchema.index({ registrationDate: -1 });

// Add a method to get formatted registration data
registrationSchema.methods.getFormattedData = function() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        phone: this.phone,
        status: this.status,
        paymentStatus: this.paymentStatus,
        registeredOn: this.registrationDate.toLocaleDateString('en-IN'),
        registeredAt: this.registrationDate.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata'
        })
    };
};

// Export the model
module.exports = mongoose.model('Registration', registrationSchema);
