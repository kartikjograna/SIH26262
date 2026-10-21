const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Institution = require('./models/Institution');
const Application = require('./models/Application');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aicte_workflow');
        console.log('Connected to MongoDB for seeding...');

        await Institution.deleteMany({});
        await Application.deleteMany({});
        await Notification.deleteMany({});
        await AuditLog.deleteMany({});

        const institutions = await Institution.insertMany([
            {
                name: 'Delhi Institute of Engineering & Technology',
                code: 'AICTE-DEL-10492',
                email: 'director@dietdelhi.edu.in',
                region: 'Northern',
                address: 'Plot 4, Institutional Area, Phase II, New Delhi'
            },
            {
                name: 'Bangalore Academy of Advanced Technologies',
                code: 'AICTE-BLR-20381',
                email: 'approvals@baat.edu.in',
                region: 'Southern',
                address: 'Electronic City Phase 1, Bengaluru, Karnataka'
            },
            {
                name: 'Maharashtra Polytechnic & Management Institute',
                code: 'AICTE-MUM-30914',
                email: 'registrar@mpmi.ac.in',
                region: 'Western',
                address: 'S.V. Road, Andheri West, Mumbai, Maharashtra'
            },
            {
                name: 'Kolkata Institute of Computing Sciences',
                code: 'AICTE-KOL-40521',
                email: 'admin@kics.edu.in',
                region: 'Eastern',
                address: 'Salt Lake Sector V, Kolkata, West Bengal'
            }
        ]);

        const inst1 = institutions[0];
        const inst2 = institutions[1];
        const inst3 = institutions[2];

        const now = new Date();
        const expiredDate = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000); // 25 days ago (Red)
        const expiringSoonDate = new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000); // 18 days ahead (Amber)
        const validDate = new Date(now.getTime() + 450 * 24 * 60 * 60 * 1000); // 450 days ahead (Green)

        const app1 = await Application.create({
            institutionId: inst1._id,
            applicationType: 'SCRUTINY_EVC',
            currentStage: 'SCRUTINY',
            status: 'PENDING',
            assignedTo: 'Regional Scrutiny Officer - North',
            submittedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
            lastActionAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            documents: [
                {
                    docType: 'LEASE_AGREEMENT',
                    fileUrl: 'https://docs.aicte-india.org/demo/lease-diet-delhi.pdf',
                    expiryDate: expiringSoonDate,
                    isValid: true
                },
                {
                    docType: 'BUILDING_PLAN_APPROVAL',
                    fileUrl: 'https://docs.aicte-india.org/demo/bpa-diet-delhi.pdf',
                    expiryDate: validDate,
                    isValid: true
                },
                {
                    docType: 'FIRE_SAFETY_CERTIFICATE',
                    fileUrl: 'https://docs.aicte-india.org/demo/fire-diet-delhi.pdf',
                    expiryDate: validDate,
                    isValid: true
                }
            ],
            comments: [
                {
                    user: 'Regional Officer North',
                    text: 'Scrutiny committee noted lease agreement requires renewal prior to EVC clearance.',
                    timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
                }
            ]
        });

        const app2 = await Application.create({
            institutionId: inst2._id,
            applicationType: 'EVC_SAC',
            currentStage: 'DEFICIENCY',
            status: 'PENDING',
            assignedTo: 'Regional Director - South',
            submittedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            lastActionAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            documents: [
                {
                    docType: 'LEASE_AGREEMENT',
                    fileUrl: 'https://docs.aicte-india.org/demo/lease-baat-blr.pdf',
                    expiryDate: expiredDate,
                    isValid: false
                },
                {
                    docType: 'OCCUPANCY_CERTIFICATE',
                    fileUrl: 'https://docs.aicte-india.org/demo/occupancy-baat.pdf',
                    expiryDate: validDate,
                    isValid: true
                }
            ],
            comments: [
                {
                    user: 'Scrutiny Officer - South',
                    text: 'Lease expired on registered parcel 12B. Application reverted to DEFICIENCY.',
                    timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
                }
            ]
        });

        const app3 = await Application.create({
            institutionId: inst3._id,
            applicationType: 'ONLY_SCRUTINY',
            currentStage: 'SUBMITTED',
            status: 'PENDING',
            assignedTo: 'Western Region Scrutiny Desk',
            submittedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            lastActionAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            documents: [
                {
                    docType: 'LEASE_AGREEMENT',
                    fileUrl: 'https://docs.aicte-india.org/demo/lease-mpmi-mum.pdf',
                    expiryDate: validDate,
                    isValid: true
                },
                {
                    docType: 'AFFILIATING_UNIVERSITY_NOC',
                    fileUrl: 'https://docs.aicte-india.org/demo/noc-mpmi.pdf',
                    expiryDate: validDate,
                    isValid: true
                }
            ],
            comments: []
        });

        // Audit Logs for App 1
        await AuditLog.insertMany([
            {
                applicationId: app1._id,
                actionBy: 'Institution Admin (DIET)',
                action: 'SUBMITTED',
                fromStage: 'DRAFT',
                toStage: 'SUBMITTED',
                remarks: 'Initial application submission with institutional undertaking.',
                timestamp: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000)
            },
            {
                applicationId: app1._id,
                actionBy: 'RO North Clerk',
                action: 'APPROVE',
                fromStage: 'SUBMITTED',
                toStage: 'SCRUTINY',
                remarks: 'Initial document check passed. Allocated to Scrutiny Committee.',
                timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            }
        ]);

        // Audit Logs for App 2
        await AuditLog.insertMany([
            {
                applicationId: app2._id,
                actionBy: 'BAAT Principal',
                action: 'SUBMITTED',
                fromStage: 'DRAFT',
                toStage: 'SUBMITTED',
                remarks: 'Application submitted for Extension of Approval.',
                timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            },
            {
                applicationId: app2._id,
                actionBy: 'South Bureau Lead',
                action: 'APPROVE',
                fromStage: 'SUBMITTED',
                toStage: 'SCRUTINY',
                remarks: 'Moved to scrutiny stage.',
                timestamp: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
            },
            {
                applicationId: app2._id,
                actionBy: 'Scrutiny Officer S2',
                action: 'REVERT',
                fromStage: 'SCRUTINY',
                toStage: 'DEFICIENCY',
                remarks: 'Lease Agreement expired. Reverted under APH Clause 2.4.1.',
                timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
            }
        ]);

        // Notifications
        await Notification.insertMany([
            {
                recipientId: inst1._id,
                type: 'EXPIRY',
                message: 'Alert: Your Registered Lease Agreement expires in 18 days. Please upload renewed deed.',
                severity: 'MEDIUM',
                relatedApplication: app1._id,
                isRead: false,
                createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                recipientId: inst1._id,
                type: 'ACTION_REQUIRED',
                message: 'Your application has been assigned to Scrutiny Committee. Keep original papers ready.',
                severity: 'LOW',
                relatedApplication: app1._id,
                isRead: true,
                createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            },
            {
                recipientId: inst2._id,
                type: 'EXPIRY',
                message: 'CRITICAL: Land Lease Agreement is EXPIRED. Application moved to DEFICIENCY.',
                severity: 'HIGH',
                relatedApplication: app2._id,
                isRead: false,
                createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
            }
        ]);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
