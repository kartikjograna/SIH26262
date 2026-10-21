/**
 * AICTE Approval Workflow Automation System - API Service Layer
 * Connects to Node.js/Express API at http://localhost:5000/api
 * Includes seamless Standalone Demo Mode fallback for offline demos.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


// Initial Mock Seed Data for Standalone Demo Mode
const INITIAL_INSTITUTIONS = [
  {
    _id: 'inst_delhi_101',
    name: 'Delhi Institute of Engineering & Technology',
    code: 'AICTE-DEL-10492',
    email: 'director@dietdelhi.edu.in',
    region: 'Northern',
    address: 'Plot 4, Institutional Area, Phase II, New Delhi'
  },
  {
    _id: 'inst_blr_202',
    name: 'Bangalore Academy of Advanced Technologies',
    code: 'AICTE-BLR-20381',
    email: 'approvals@baat.edu.in',
    region: 'Southern',
    address: 'Electronic City Phase 1, Bengaluru, Karnataka'
  },
  {
    _id: 'inst_mum_303',
    name: 'Maharashtra Polytechnic & Management Institute',
    code: 'AICTE-MUM-30914',
    email: 'registrar@mpmi.ac.in',
    region: 'Western',
    address: 'S.V. Road, Andheri West, Mumbai, Maharashtra'
  },
  {
    _id: 'inst_kol_404',
    name: 'Kolkata Institute of Computing Sciences',
    code: 'AICTE-KOL-40521',
    email: 'admin@kics.edu.in',
    region: 'Eastern',
    address: 'Salt Lake Sector V, Kolkata, West Bengal'
  }
];

// Helper to calculate relative dates
const now = new Date();
const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

const INITIAL_APPLICATIONS = [
  {
    _id: 'APP-2025-0891',
    institutionId: INITIAL_INSTITUTIONS[0],
    applicationType: 'SCRUTINY_EVC',
    currentStage: 'SCRUTINY',
    status: 'PENDING',
    assignedTo: 'Regional Scrutiny Committee - North',
    submittedAt: addDays(-14),
    lastActionAt: addDays(-2),
    programs: ['Computer Science & Engg (Intake: 180)', 'AI & Data Science (Intake: 60)', 'Electronics & Comm (Intake: 120)'],
    academicYear: '2025-2026',
    documents: [
      {
        docType: 'LEASE_AGREEMENT',
        fileUrl: 'https://docs.aicte-india.org/vault/lease_diet_delhi_2025.pdf',
        expiryDate: addDays(21), // AMBER: Expiring in 21 days!
        isValid: true,
        uploadedAt: addDays(-14)
      },
      {
        docType: 'BUILDING_PLAN_APPROVAL',
        fileUrl: 'https://docs.aicte-india.org/vault/bpa_diet_2025.pdf',
        expiryDate: addDays(420), // GREEN: > 1 year
        isValid: true,
        uploadedAt: addDays(-14)
      },
      {
        docType: 'FIRE_SAFETY_CERTIFICATE',
        fileUrl: 'https://docs.aicte-india.org/vault/fire_safety_diet.pdf',
        expiryDate: addDays(180), // GREEN: 180 days
        isValid: true,
        uploadedAt: addDays(-14)
      }
    ],
    comments: [
      {
        user: 'RO North Scrutiny Officer',
        text: 'Preliminary scrutiny underway. Note that the Land Lease Agreement expires within 30 days. Renewal deed must be uploaded before EVC scheduling.',
        timestamp: addDays(-2)
      }
    ],
    auditLogs: [
      {
        actionBy: 'DIET Registrar',
        action: 'SUBMITTED',
        fromStage: 'DRAFT',
        toStage: 'SUBMITTED',
        remarks: 'New application submitted with Institutional Undertaking.',
        timestamp: addDays(-14)
      },
      {
        actionBy: 'Northern Regional Desk',
        action: 'APPROVE',
        fromStage: 'SUBMITTED',
        toStage: 'SCRUTINY',
        remarks: 'Initial document checklist verified. Routed to Regional Scrutiny Panel.',
        timestamp: addDays(-9)
      }
    ]
  },
  {
    _id: 'APP-2025-0744',
    institutionId: INITIAL_INSTITUTIONS[1],
    applicationType: 'EVC_SAC',
    currentStage: 'DEFICIENCY',
    status: 'PENDING',
    assignedTo: 'Regional Director - South Bureau',
    submittedAt: addDays(-28),
    lastActionAt: addDays(-1),
    programs: ['Information Technology (Intake: 120)', 'Mechanical Engg (Intake: 60)'],
    academicYear: '2025-2026',
    documents: [
      {
        docType: 'LEASE_AGREEMENT',
        fileUrl: 'https://docs.aicte-india.org/vault/lease_baat_blr.pdf',
        expiryDate: addDays(-15), // RED: EXPIRED 15 days ago!
        isValid: false,
        uploadedAt: addDays(-28)
      },
      {
        docType: 'OCCUPANCY_CERTIFICATE',
        fileUrl: 'https://docs.aicte-india.org/vault/occupancy_baat.pdf',
        expiryDate: addDays(500),
        isValid: true,
        uploadedAt: addDays(-28)
      }
    ],
    comments: [
      {
        user: 'South Scrutiny Panel',
        text: 'Registered Lease deed expired on parcel 14. Returned under APH Clause 2.4.1.',
        timestamp: addDays(-1)
      }
    ],
    auditLogs: [
      {
        actionBy: 'BAAT Principal',
        action: 'SUBMITTED',
        fromStage: 'DRAFT',
        toStage: 'SUBMITTED',
        remarks: 'Submitted for Extension of Approval (EoA).',
        timestamp: addDays(-28)
      },
      {
        actionBy: 'South Bureau Assistant',
        action: 'APPROVE',
        fromStage: 'SUBMITTED',
        toStage: 'SCRUTINY',
        remarks: 'Passed preliminary check.',
        timestamp: addDays(-18)
      },
      {
        actionBy: 'Senior Scrutiny Officer S2',
        action: 'REVERT',
        fromStage: 'SCRUTINY',
        toStage: 'DEFICIENCY',
        remarks: 'Critical: Land Lease document is EXPIRED. Application reverted for compliance.',
        timestamp: addDays(-1)
      }
    ]
  },
  {
    _id: 'APP-2025-1102',
    institutionId: INITIAL_INSTITUTIONS[2],
    applicationType: 'ONLY_SCRUTINY',
    currentStage: 'SUBMITTED',
    status: 'PENDING',
    assignedTo: 'Western Region Intake Cell',
    submittedAt: addDays(-3),
    lastActionAt: addDays(-3),
    programs: ['Diploma in Automation & Robotics (Intake: 60)'],
    academicYear: '2025-2026',
    documents: [
      {
        docType: 'LEASE_AGREEMENT',
        fileUrl: 'https://docs.aicte-india.org/vault/lease_mpmi_mum.pdf',
        expiryDate: addDays(650), // GREEN: Valid for > 1.5 years
        isValid: true,
        uploadedAt: addDays(-3)
      },
      {
        docType: 'AFFILIATING_UNIVERSITY_NOC',
        fileUrl: 'https://docs.aicte-india.org/vault/noc_mpmi.pdf',
        expiryDate: addDays(365),
        isValid: true,
        uploadedAt: addDays(-3)
      }
    ],
    comments: [],
    auditLogs: [
      {
        actionBy: 'MPMI Dean',
        action: 'SUBMITTED',
        fromStage: 'DRAFT',
        toStage: 'SUBMITTED',
        remarks: 'Application submitted with statutory fee and digital sign.',
        timestamp: addDays(-3)
      }
    ]
  },
  {
    _id: 'APP-2025-0619',
    institutionId: INITIAL_INSTITUTIONS[3],
    applicationType: 'SCRUTINY_EVC',
    currentStage: 'EVC',
    status: 'PENDING',
    assignedTo: 'Eastern Region Inspection Bureau',
    submittedAt: addDays(-40),
    lastActionAt: addDays(-6),
    programs: ['Cybersecurity & Digital Forensics (Intake: 60)'],
    academicYear: '2025-2026',
    documents: [
      {
        docType: 'LEASE_AGREEMENT',
        fileUrl: 'https://docs.aicte-india.org/vault/lease_kics_kol.pdf',
        expiryDate: addDays(300),
        isValid: true,
        uploadedAt: addDays(-40)
      }
    ],
    comments: [],
    auditLogs: [
      {
        actionBy: 'KICS Director',
        action: 'SUBMITTED',
        fromStage: 'DRAFT',
        toStage: 'SUBMITTED',
        remarks: 'Application submitted for new emerging course.',
        timestamp: addDays(-40)
      },
      {
        actionBy: 'RO East Scrutiny',
        action: 'APPROVE',
        fromStage: 'SUBMITTED',
        toStage: 'SCRUTINY',
        remarks: 'Documents verified.',
        timestamp: addDays(-30)
      },
      {
        actionBy: 'RO East Committee',
        action: 'APPROVE',
        fromStage: 'SCRUTINY',
        toStage: 'EVC',
        remarks: 'Scrutiny cleared. Queued for Expert Visit Committee inspection.',
        timestamp: addDays(-6)
      }
    ]
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    _id: 'notif_1',
    recipientId: INITIAL_INSTITUTIONS[0]._id,
    type: 'EXPIRY',
    message: 'WARNING: Your Registered Lease Agreement (DIET Delhi) expires in 21 days! Upload renewed deed to avoid reversion.',
    severity: 'MEDIUM',
    relatedApplication: 'APP-2025-0891',
    isRead: false,
    createdAt: addDays(-1)
  },
  {
    _id: 'notif_2',
    recipientId: INITIAL_INSTITUTIONS[0]._id,
    type: 'ACTION_REQUIRED',
    message: 'Application APP-2025-0891 has been scheduled for Regional Scrutiny Panel review.',
    severity: 'LOW',
    relatedApplication: 'APP-2025-0891',
    isRead: true,
    createdAt: addDays(-9)
  },
  {
    _id: 'notif_3',
    recipientId: INITIAL_INSTITUTIONS[1]._id,
    type: 'EXPIRY',
    message: 'CRITICAL DEFICIENCY: Land Lease Agreement is EXPIRED. Application APP-2025-0744 reverted to DEFICIENCY.',
    severity: 'HIGH',
    relatedApplication: 'APP-2025-0744',
    isRead: false,
    createdAt: addDays(-1)
  }
];

// Workflow transition engine matching backend APH rules
const workflowRules = {
  'ONLY_SCRUTINY': ['SUBMITTED', 'SCRUTINY', 'APPROVED'],
  'SCRUTINY_EVC': ['SUBMITTED', 'SCRUTINY', 'EVC', 'APPROVED'],
  'EVC_SAC': ['SUBMITTED', 'SCRUTINY', 'EVC', 'SAC_SHC', 'APPROVED'],
  'ONLY_EVC': ['SUBMITTED', 'EVC', 'APPROVED']
};

export const getNextStageAPH = (type, currentStage) => {
  const path = workflowRules[type] || ['SUBMITTED', 'SCRUTINY', 'APPROVED'];
  const currentIndex = path.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === path.length - 1) return 'APPROVED';
  return path[currentIndex + 1];
};

// Local storage management for demo persistence
const getMockApps = () => {
  const data = localStorage.getItem('aicte_demo_apps');
  if (data) {
    try { return JSON.parse(data); } catch (e) { /* ignore */ }
  }
  localStorage.setItem('aicte_demo_apps', JSON.stringify(INITIAL_APPLICATIONS));
  return INITIAL_APPLICATIONS;
};

const saveMockApps = (apps) => {
  localStorage.setItem('aicte_demo_apps', JSON.stringify(apps));
};

const getMockNotifs = () => {
  const data = localStorage.getItem('aicte_demo_notifs');
  if (data) {
    try { return JSON.parse(data); } catch (e) { /* ignore */ }
  }
  localStorage.setItem('aicte_demo_notifs', JSON.stringify(INITIAL_NOTIFICATIONS));
  return INITIAL_NOTIFICATIONS;
};

const saveMockNotifs = (notes) => {
  localStorage.setItem('aicte_demo_notifs', JSON.stringify(notes));
};

// Safe Fetch with timeout
async function requestWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, credentials: 'omit', signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// API Service Interface
export const api = {
  // Check backend availability
  async checkBackendHealth() {
    try {
      const res = await requestWithTimeout(`${API_BASE_URL}/health`, { method: 'GET' }, 1500);
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  // GET /institutions
  async getInstitutions() {
    try {
      const res = await requestWithTimeout(`${API_BASE_URL}/institutions`, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      // Backend offline: use mock
    }
    return INITIAL_INSTITUTIONS;
  },

  // GET /applications?role=INSTITUTION&id={id}
  async getApplications(role, id) {
    try {
      let url = `${API_BASE_URL}/applications`;
      if (role && id) {
        url += `?role=${encodeURIComponent(role)}&id=${encodeURIComponent(id)}`;
      }
      const res = await requestWithTimeout(url, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        return { isOnline: true, data: json.data || [] };
      }
    } catch (err) {
      // Backend offline: fallback to mock store
    }


    // Standalone fallback
    const apps = getMockApps();
    let filtered = apps;
    if (role === 'INSTITUTION' && id) {
      filtered = apps.filter(a => {
        const instId = typeof a.institutionId === 'object' ? a.institutionId?._id : a.institutionId;
        return instId === id;
      });
    }
    return { isOnline: false, data: filtered };
  },

  // GET /applications/pending
  async getPendingApplications() {
    try {
      const res = await requestWithTimeout(`${API_BASE_URL}/applications/pending`, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        return { isOnline: true, data: json.data || [] };
      }
    } catch (err) {
      // Backend offline
    }

    // Standalone fallback
    const apps = getMockApps();
    const pending = apps.filter(a => a.status === 'PENDING' && a.currentStage !== 'APPROVED');
    return { isOnline: false, data: pending };
  },

  // GET /applications/:appId
  async getApplicationById(appId) {
    try {
      const res = await requestWithTimeout(`${API_BASE_URL}/applications/${appId}`, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        return { isOnline: true, data: json.data };
      }
    } catch (err) {
      // Backend offline
    }

    // Standalone fallback
    const apps = getMockApps();
    const app = apps.find(a => a._id === appId || a.id === appId);
    return { isOnline: false, data: app || null };
  },

  // GET /applications/:appId/audit
  async getApplicationAuditLogs(appId) {
    try {
      const res = await requestWithTimeout(`${API_BASE_URL}/applications/${appId}/audit`, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        return { isOnline: true, data: json.data || [] };
      }
    } catch (err) {
      // Backend offline
    }

    // Standalone fallback
    const apps = getMockApps();
    const app = apps.find(a => a._id === appId || a.id === appId);
    return { isOnline: false, data: app?.auditLogs || [] };
  },

  // POST /applications/submit
  async submitApplication(payload) {
    try {
      const res = await requestWithTimeout(`${API_BASE_URL}/applications/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        return { isOnline: true, success: true, data: json.data };
      }
    } catch (err) {
      // Backend offline
    }

    // Standalone fallback
    const apps = getMockApps();
    const inst = INITIAL_INSTITUTIONS.find(i => i._id === payload.institutionId) || {
      _id: payload.institutionId || 'inst_' + Date.now(),
      name: payload.institutionName || 'Demo Technical Institute',
      code: 'AICTE-DEMO-' + Math.floor(1000 + Math.random() * 9000),
      region: payload.region || 'Northern'
    };

    const newApp = {
      _id: 'APP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      institutionId: inst,
      applicationType: payload.applicationType || 'SCRUTINY_EVC',
      currentStage: 'SUBMITTED',
      status: 'PENDING',
      assignedTo: `${inst.region} Regional Scrutiny Desk`,
      submittedAt: new Date().toISOString(),
      lastActionAt: new Date().toISOString(),
      programs: payload.programs || ['Technical Engineering Course'],
      academicYear: payload.academicYear || '2025-2026',
      documents: payload.documents || [],
      comments: [],
      auditLogs: [
        {
          actionBy: payload.submittedBy || 'Institution Principal',
          action: 'SUBMITTED',
          fromStage: 'DRAFT',
          toStage: 'SUBMITTED',
          remarks: 'Online Application submitted with Institutional Undertaking.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    apps.unshift(newApp);
    saveMockApps(apps);
    return { isOnline: false, success: true, data: newApp };
  },

  // POST /compliance/upload
  async uploadCompliance(payload) {
    try {
      const res = await requestWithTimeout(`${API_BASE_URL}/compliance/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        return { isOnline: true, success: true, message: json.message };
      }
    } catch (err) {
      // Backend offline
    }

    // Standalone fallback
    const apps = getMockApps();
    const app = apps.find(a => a._id === payload.appId || a.id === payload.appId);
    if (!app) {
      return { isOnline: false, success: false, message: 'Application not found' };
    }

    if (!app.documents) app.documents = [];
    const docIdx = app.documents.findIndex(d => d.docType === payload.docType);
    const newDoc = {
      docType: payload.docType,
      fileUrl: payload.fileUrl || 'https://docs.aicte-india.org/vault/' + payload.docType.toLowerCase() + '.pdf',
      expiryDate: payload.expiryDate,
      isValid: true,
      uploadedAt: new Date().toISOString()
    };

    if (docIdx > -1) {
      app.documents[docIdx] = newDoc;
    } else {
      app.documents.push(newDoc);
    }

    // Add Audit Log
    if (!app.auditLogs) app.auditLogs = [];
    app.auditLogs.unshift({
      actionBy: 'Institution Compliance Officer',
      action: 'DOCUMENT_UPLOAD',
      fromStage: app.currentStage,
      toStage: app.currentStage,
      remarks: `Uploaded ${payload.docType} with expiry date ${payload.expiryDate.split('T')[0]}.`,
      timestamp: new Date().toISOString()
    });

    saveMockApps(apps);

    // If lease document renewed and was in DEFICIENCY, add notification
    const notifs = getMockNotifs();
    notifs.unshift({
      _id: 'notif_' + Date.now(),
      recipientId: typeof app.institutionId === 'object' ? app.institutionId._id : app.institutionId,
      type: 'ACTION_REQUIRED',
      message: `Document ${payload.docType} received for application ${app._id}. Official scrutiny verification pending.`,
      severity: 'LOW',
      relatedApplication: app._id,
      isRead: false,
      createdAt: new Date().toISOString()
    });
    saveMockNotifs(notifs);

    return { isOnline: false, success: true, message: 'Compliance document uploaded and logged successfully.' };
  },

  // POST /applications/process/:appId
  async processApplication(appId, payload) {
    try {
      const res = await requestWithTimeout(`${API_BASE_URL}/applications/process/${appId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        return { isOnline: true, success: true, data: json.data };
      }
    } catch (err) {
      // Backend offline
    }

    // Standalone fallback
    const apps = getMockApps();
    const app = apps.find(a => a._id === appId || a.id === appId);
    if (!app) {
      return { isOnline: false, success: false, message: 'Application not found' };
    }

    const oldStage = app.currentStage;
    let nextStage = oldStage;

    if (payload.action === 'APPROVE') {
      nextStage = getNextStageAPH(app.applicationType, oldStage);
    } else if (payload.action === 'REVERT') {
      nextStage = 'DEFICIENCY';
    } else if (payload.action === 'FIXED') {
      nextStage = 'SUBMITTED';
    }

    app.currentStage = nextStage;
    app.lastActionAt = new Date().toISOString();
    if (nextStage === 'APPROVED') {
      app.status = 'COMPLETED';
    }

    // Add Audit Log
    if (!app.auditLogs) app.auditLogs = [];
    app.auditLogs.unshift({
      actionBy: payload.user || 'AICTE Official',
      action: payload.action,
      fromStage: oldStage,
      toStage: nextStage,
      remarks: payload.remarks || 'Status updated by authorized official.',
      timestamp: new Date().toISOString()
    });

    // Add comment
    if (!app.comments) app.comments = [];
    app.comments.unshift({
      user: payload.user || 'AICTE Official',
      text: `${payload.action}: ${payload.remarks || 'Action taken'}`,
      timestamp: new Date().toISOString()
    });

    saveMockApps(apps);

    // Send notification to institution
    const notifs = getMockNotifs();
    notifs.unshift({
      _id: 'notif_' + Date.now(),
      recipientId: typeof app.institutionId === 'object' ? app.institutionId._id : app.institutionId,
      type: payload.action === 'REVERT' ? 'EXPIRY' : 'ACTION_REQUIRED',
      message: payload.action === 'REVERT'
        ? `DEFICIENCY NOTICE for ${app._id}: Application reverted from ${oldStage}. Remarks: ${payload.remarks}`
        : `PROGRESS UPDATE: Application ${app._id} has advanced to stage ${nextStage}. Remarks: ${payload.remarks}`,
      severity: payload.action === 'REVERT' ? 'HIGH' : 'MEDIUM',
      relatedApplication: app._id,
      isRead: false,
      createdAt: new Date().toISOString()
    });
    saveMockNotifs(notifs);

    return { isOnline: false, success: true, data: app };
  },

  // GET /notifications/:userId
  async getNotifications(userId) {
    try {
      const res = await requestWithTimeout(`${API_BASE_URL}/notifications/${userId}`, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        return { isOnline: true, data: json.data || [] };
      }
    } catch (err) {
      // Backend offline
    }

    // Standalone fallback
    const notifs = getMockNotifs();
    const userNotes = notifs.filter(n => !userId || n.recipientId === userId);
    return { isOnline: false, data: userNotes };
  },

  // PATCH /notifications/read/:id
  async markNotificationRead(id) {
    try {
      const res = await requestWithTimeout(`${API_BASE_URL}/notifications/read/${id}`, { method: 'PATCH' });
      if (res.ok) return { isOnline: true, success: true };
    } catch (err) {
      // Backend offline
    }

    // Standalone fallback
    const notifs = getMockNotifs();
    const item = notifs.find(n => n._id === id);
    if (item) item.isRead = true;
    saveMockNotifs(notifs);
    return { isOnline: false, success: true };
  },

  // Export mock institutions
  getMockInstitutions() {
    return INITIAL_INSTITUTIONS;
  }
};
