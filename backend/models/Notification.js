const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ['DEADLINE', 'EXPIRY', 'ACTION_REQUIRED', 'ESCALATION'] },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
