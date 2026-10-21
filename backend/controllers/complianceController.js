const Application = require('../models/Application');
const Notification = require('../models/Notification');

exports.uploadCompliance = async (req, res) => {
    try {
        const { appId, docType, fileUrl, expiryDate } = req.body;
        const app = await Application.findById(appId);
        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

        const docIndex = app.documents.findIndex(d => d.docType === docType);
        if (docIndex > -1) {
            app.documents[docIndex] = { docType, fileUrl, expiryDate, isValid: true };
        } else {
            app.documents.push({ docType, fileUrl, expiryDate, isValid: true });
        }

        await app.save();
        res.json({ success: true, message: 'Compliance document uploaded' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.checkExpiries = async (req, res) => {
    try {
        const today = new Date();
        const warningThreshold = new Date();
        warningThreshold.setDate(today.getDate() + 30);

        const apps = await Application.find({ "documents.expiryDate": { $exists: true } });
        const alerts = [];

        apps.forEach(app => {
            app.documents.forEach(doc => {
                if (doc.expiryDate < today) {
                    alerts.push({ appId: app._id, docType: doc.docType, status: 'EXPIRED' });
                    // Create notification in DB
                    Notification.create({
                        recipientId: app.institutionId,
                        type: 'EXPIRY',
                        message: `Document ${doc.docType} has expired. Please renew immediately.`,
                        severity: 'HIGH',
                        relatedApplication: app._id
                    });
                } else if (doc.expiryDate < warningThreshold) {
                    alerts.push({ appId: app._id, docType: doc.docType, status: 'WARNING' });
                    Notification.create({
                        recipientId: app.institutionId,
                        type: 'EXPIRY',
                        message: `Document ${doc.docType} will expire in less than 30 days.`,
                        severity: 'MEDIUM',
                        relatedApplication: app._id
                    });
                }
            });
        });

        res.json({ success: true, alerts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
