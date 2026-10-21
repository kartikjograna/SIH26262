const express = require('express');
const router = express.Router();
const { 
    submitApplication, 
    getApplications, 
    processApplication, 
    getPendingApplications,
    getApplicationById,
    getApplicationAuditLogs
} = require('../controllers/applicationController');

router.post('/submit', submitApplication);
router.get('/', getApplications);
router.get('/pending', getPendingApplications);
router.get('/:appId', getApplicationById);
router.get('/:appId/audit', getApplicationAuditLogs);
router.post('/process/:appId', processApplication);

module.exports = router;

