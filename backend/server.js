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

// Root Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        service: 'AICTE Approval Workflow Automation Backend API',
        status: 'online',
        version: '1.0.0',
        documentation: 'APH 2025-26 Regulatory Workflow Engine',
        endpoints: {
            health: '/api/health',
            institutions: '/api/institutions',
            pendingApplications: '/api/applications/pending'
        }
    });
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'AICTE Approval API is online' });
});

// One-Click Seed Database Endpoint (Allows free-tier cloud database seeding)
const seedDatabase = require('./seedData');
app.get('/api/seed-db', async (req, res) => {
    try {
        const stats = await seedDatabase();
        res.json({ 
            success: true, 
            message: 'Database seeded successfully with sample institutions, applications, and documents!',
            data: stats 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
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

