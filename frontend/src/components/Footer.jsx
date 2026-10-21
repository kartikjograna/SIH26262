import React from 'react';

const Footer = () => {
  return (
    <footer className="gov-footer" role="contentinfo">
      <div className="footer-top">
        <div className="footer-col">
          <h4>अखिल भारतीय तकनीकी शिक्षा परिषद</h4>
          <p style={{ fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
            All India Council for Technical Education
          </p>
          <p>
            Statutory Body under the Ministry of Education, Government of India.<br />
            Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070
          </p>
          <p style={{ marginTop: '8px', fontSize: '0.76rem', color: '#94a3b8' }}>
            National Portal for Automated Approval, Compliance Monitoring & Vigilance.
          </p>
        </div>

        <div className="footer-col">
          <h4>Regulatory & Policy Framework</h4>
          <ul className="footer-links">
            <li><a href="#aph" onClick={(e) => e.preventDefault()}>Approval Process Handbook (APH 2025-26)</a></li>
            <li><a href="#norms" onClick={(e) => e.preventDefault()}>Land Norms & Lease Deed Regulations</a></li>
            <li><a href="#evc" onClick={(e) => e.preventDefault()}>Expert Visit Committee (EVC) Manual</a></li>
            <li><a href="#rti" onClick={(e) => e.preventDefault()}>Right to Information (RTI Act)</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Accessibility & Technical Assistance</h4>
          <ul className="footer-links">
            <li><a href="#help" onClick={(e) => e.preventDefault()}>Institutional Helpdesk & Support Desk</a></li>
            <li><a href="#access" onClick={(e) => e.preventDefault()}>Screen Reader Access & WCAG AA Compliance</a></li>
            <li><a href="#security" onClick={(e) => e.preventDefault()}>Data Confidentiality & Audit Trail Security</a></li>
            <li><a href="#disclaimer" onClick={(e) => e.preventDefault()}>Terms of Use & Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span>© 2025-2026 All India Council for Technical Education (AICTE), Government of India. All Rights Reserved.</span>
          <span style={{ color: '#94a3b8' }}>Designed & Automated for SIH Smart Automation</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
