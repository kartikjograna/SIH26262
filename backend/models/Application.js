const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
    applicationType: {
        type: String,
        enum: ['ONLY_SCRUTINY', 'SCRUTINY_EVC', 'EVC_SAC', 'ONLY_EVC'],
        required: true
    },
    currentStage: {
        type: String,
        enum: ['SUBMITTED', 'SCRUTINY', 'EVC', 'SAC_SHC', 'APPROVED', 'REJECTED', 'DEFICIENCY'],
        default: 'SUBMITTED'
    },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'OVERDUE'], default: 'PENDING' },
    submittedAt: { type: Date, default: Date.now },
    lastActionAt: { type: Date, default: Date.now },
    assignedTo: { type: String }, // Official ID or Role
    documents: [{
        docType: String, // e.g., 'LEASE_AGREEMENT'
        fileUrl: String,
        expiryDate: Date,
        isValid: { type: Boolean, default: true }
    }],
    comments: [{
        user: String,
        text: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
