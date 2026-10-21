# System Architecture: AICTE Approval Workflow Automation

## 1. High-Level Architecture
The system follows a **Modular Monolith** or **Microservices** approach (depending on scale) built on a modern web stack to ensure security, scalability, and ease of configuration.

### Tech Stack (Proposed)
- **Frontend**: React.js / Next.js (for role-based dashboards and responsive institutional portals).
- **Backend**: Node.js (Express) or Python (FastAPI) for the workflow orchestration logic.
- **Database**: PostgreSQL (Relational data for applications, audit trails, and complex queries).
- **Caching/Queue**: Redis (for managing automated alerts and EVC scheduling queues).
- **Document Storage**: AWS S3 or Azure Blob Storage (Secure, encrypted storage for lease and compliance docs).
- **Authentication**: OAuth2 / OpenID Connect with Role-Based Access Control (RBAC).

## 2. Architectural Components

### A. Workflow Orchestrator
The heart of the system. It consists of:
- **Rule Engine**: A JSON-based configuration file that maps the APH regulations to system logic (e.g., `if stage == 'Scrutiny' AND status == 'Complete' THEN route to 'EVC'`).
- **State Machine**: Manages the current state of every application and prevents illegal transitions.

### B. Alert & Notification Service
A decoupled service that monitors the database for:
- `CurrentDate >= (ExpiryDate - 30 days)` $\rightarrow$ Trigger Warning Alert.
- `CurrentDate > Deadline` $\rightarrow$ Trigger Escalation Alert.
It integrates with an SMTP server and SMS Gateway.

### C. Document Management System (DMS)
- **Version Control**: Keeps track of renewed lease documents while archiving expired ones.
- **OCR Integration (Optional)**: Basic OCR to extract expiry dates from uploaded PDFs to reduce manual entry.

## 3. Data Flow Diagram (Logical)
1. **Application Submission** $\rightarrow$ [Workflow Orchestrator] $\rightarrow$ [Route to Scrutiny].
2. **Scrutiny Completion** $\rightarrow$ [Rule Engine] $\rightarrow$ [Route to EVC/SAC].
3. **Approval with Undertaking** $\rightarrow$ [Compliance Tracker] $\rightarrow$ [Set Deadline].
4. **Deadline Approach** $\rightarrow$ [Alert Service] $\rightarrow$ [Notify Institution].
5. **Document Upload** $\rightarrow$ [DMS] $\rightarrow$ [Notify Official for Verification].
6. **Verification Fail/Delay** $\rightarrow$ [Escalation Logic] $\rightarrow$ [Notify Bureau Officer].

## 4. Security Design
- **Data Encryption**: AES-256 for documents at rest; TLS 1.3 for data in transit.
- **RBAC**: Strict separation of concerns (Institution $\neq$ Regional Officer $\neq$ Bureau Officer).
- **Audit Logging**: Every database write is mirrored to an immutable `audit_logs` table containing `user_id`, `timestamp`, `action`, `previous_state`, and `new_state`.

## 5. Scalability & Availability
- **Horizontal Scaling**: Stateless backend allows adding more instances behind a Load Balancer.
- **Database Indexing**: Optimized indices on `application_id`, `region_id`, and `expiry_date` for fast dashboard rendering.
