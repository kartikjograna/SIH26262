const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Institution = require('../models/Institution');

exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        let query = {};
        if (userId && userId !== 'all') {
            if (mongoose.Types.ObjectId.isValid(userId)) {
                query.recipientId = userId;
            } else {
                const inst = await Institution.findOne({
                    $or: [
                        { code: new RegExp(userId, 'i') },
                        { name: new RegExp(userId.replace('inst_', ''), 'i') }
                    ]
                });
                if (inst) {
                    query.recipientId = inst._id;
                }
            }
        }
        const notes = await Notification.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: notes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
