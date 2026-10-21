const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    actionBy: { type: String, required: true },
    action: { type: String, required: true },
    fromStage: String,
    toStage: String,
    remarks: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
