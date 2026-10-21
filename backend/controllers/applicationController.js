const mongoose = require('mongoose');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Institution = require('../models/Institution');
const { transitionApplication } = require('../utils/workflowEngine');

exports.submitApplication = async (req, res) => {
    try {
        const app = await Application.create(req.body);
        // Create initial submission audit log
        await AuditLog.create({
            applicationId: app._id,
            actionBy: req.body.submittedBy || 'Institution Admin',
            action: 'SUBMITTED',
            fromStage: 'DRAFT',
            toStage: app.currentStage || 'SUBMITTED',
            remarks: 'Application submitted for AICTE regulatory approval.'
        });
        res.status(201).json({ success: true, data: app });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getApplications = async (req, res) => {
    try {
        const { role, id } = req.query;
        let filter = {};
        if (role === 'INSTITUTION' && id) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                filter.institutionId = id;
            } else {
                // If demo string id was passed, try to match by institution code or return first
                const inst = await Institution.findOne({ 
                    $or: [
                        { code: new RegExp(id, 'i') }, 
                        { name: new RegExp(id.replace('inst_', ''), 'i') }
                    ] 
                });
                if (inst) {
                    filter.institutionId = inst._id;
                }
            }
        }

        const apps = await Application.find(filter).populate('institutionId').sort({ createdAt: -1 });
        res.json({ success: true, data: apps });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const { appId } = req.params;
        let app = null;
        if (mongoose.Types.ObjectId.isValid(appId)) {
            app = await Application.findById(appId).populate('institutionId');
        } else {
            app = await Application.findOne({ _id: appId }).populate('institutionId');
        }
        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
        const auditLogs = await AuditLog.find({ applicationId: app._id }).sort({ timestamp: -1 });
        res.json({ success: true, data: { ...app.toObject(), auditLogs } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.getApplicationAuditLogs = async (req, res) => {
    try {
        const { appId } = req.params;
        const logs = await AuditLog.find({ applicationId: appId }).sort({ timestamp: -1 });
        res.json({ success: true, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.processApplication = async (req, res) => {
    try {
        const { appId } = req.params;
        const { action, user, remarks } = req.body;
        const updatedApp = await transitionApplication(appId, action, user, remarks);
        res.json({ success: true, data: updatedApp });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getPendingApplications = async (req, res) => {
    try {
        const apps = await Application.find({
            status: 'PENDING',
            currentStage: { $ne: 'APPROVED' }
        }).populate('institutionId').sort({ submittedAt: -1 });
        res.json({ success: true, data: apps });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

