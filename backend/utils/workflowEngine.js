const Application = require('../models/Application');
const AuditLog = require('../models/AuditLog');

/**
 * Workflow Engine handles the logic of state transitions
 * based on the Application Type (APH Rules).
 */
const workflowRules = {
    'ONLY_SCRUTINY': ['SUBMITTED', 'SCRUTINY', 'APPROVED'],
    'SCRUTINY_EVC': ['SUBMITTED', 'SCRUTINY', 'EVC', 'APPROVED'],
    'EVC_SAC': ['SUBMITTED', 'SCRUTINY', 'EVC', 'SAC_SHC', 'APPROVED'],
    'ONLY_EVC': ['SUBMITTED', 'EVC', 'APPROVED']
};

const getNextStage = (type, currentStage) => {
    const path = workflowRules[type];
    if (!path) return null;
    const currentIndex = path.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === path.length - 1) return null;
    return path[currentIndex + 1];
};

const transitionApplication = async (appId, action, user, remarks = '') => {
    const app = await Application.findById(appId);
    if (!app) throw new Error('Application not found');

    const oldStage = app.currentStage;
    let newStage = oldStage;

    if (action === 'APPROVE') {
        newStage = getNextStage(app.applicationType, oldStage) || 'APPROVED';
    } else if (action === 'REVERT') {
        newStage = 'DEFICIENCY';
    } else if (action === 'FIXED') {
        newStage = 'SUBMITTED';
    }

    app.currentStage = newStage;
    app.lastActionAt = new Date();
    await app.save();

    await AuditLog.create({
        applicationId: appId,
        actionBy: user,
        action: action,
        fromStage: oldStage,
        toStage: newStage,
        remarks: remarks
    });

    return app;
};

module.exports = { transitionApplication, getNextStage };
