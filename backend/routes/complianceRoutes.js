const express = require('express');
const router = express.Router();
const { uploadCompliance, checkExpiries } = require('../controllers/complianceController');

router.post('/upload', uploadCompliance);
router.get('/check-expiries', checkExpiries);

module.exports = router;
