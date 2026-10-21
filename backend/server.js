const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dbConnect = require('./config/db');
const Institution = require('./models/Institution');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Connect to Database
dbConnect();

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'AICTE Approval API is online' });
});

// Institutions List
app.get('/api/institutions', async (req, res) => {
    try {
        const institutions = await Institution.find().sort({ name: 1 });
        res.json({ success: true, data: institutions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Routes
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/compliance', require('./routes/complianceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

