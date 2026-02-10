/**
 * Email Templates
 *
 * HTML templates for various notification emails
 */

const baseStyles = `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #4B465C;
      background-color: #F8F7FA;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .card {
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      padding: 32px;
      margin: 20px 0;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #7367F0;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #003087;
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #4B465C;
      margin: 0 0 16px 0;
    }
    h2 {
      font-size: 18px;
      font-weight: 600;
      color: #4B465C;
      margin: 24px 0 12px 0;
    }
    p {
      margin: 12px 0;
      color: #6D6B77;
      font-size: 15px;
    }
    .alert {
      padding: 16px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .alert-warning {
      background: #FFF6E5;
      border-left: 4px solid #FF9F43;
      color: #4B465C;
    }
    .alert-danger {
      background: #FFF0F0;
      border-left: 4px solid #EA5455;
      color: #4B465C;
    }
    .alert-info {
      background: #E8F4FD;
      border-left: 4px solid #7367F0;
      color: #4B465C;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #7367F0;
      color: #FFFFFF !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 16px 0;
    }
    .button:hover {
      background: #5E51E5;
    }
    .details {
      background: #F8F7FA;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #E5E7EB;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #4B465C;
    }
    .value {
      color: #6D6B77;
      text-align: right;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #A8AAAE;
      font-size: 13px;
    }
  </style>
`;

interface CertificateExpirationData {
  vendorName: string;
  coverageType: string;
  policyNumber: string;
  expirationDate: string;
  daysUntilExpiration: number;
  certificateUrl: string;
}

export function certificateExpiringTemplate(data: CertificateExpirationData): string {
  const urgency = data.daysUntilExpiration <= 30 ? 'danger' : 'warning';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Certificate Expiring Soon</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <div class="logo">Columbia University</div>
            <div style="color: #A8AAAE; font-size: 14px; margin-top: 8px;">Vendor Compliance Portal</div>
          </div>

          <h1>Certificate Expiring Soon</h1>

          <div class="alert alert-${urgency}">
            <strong>Action Required:</strong> A vendor insurance certificate will expire in ${data.daysUntilExpiration} days.
          </div>

          <p>The following certificate requires your attention:</p>

          <div class="details">
            <div class="details-row">
              <span class="label">Vendor:</span>
              <span class="value">${data.vendorName}</span>
            </div>
            <div class="details-row">
              <span class="label">Coverage Type:</span>
              <span class="value">${data.coverageType}</span>
            </div>
            <div class="details-row">
              <span class="label">Policy Number:</span>
              <span class="value">${data.policyNumber}</span>
            </div>
            <div class="details-row">
              <span class="label">Expiration Date:</span>
              <span class="value">${data.expirationDate}</span>
            </div>
            <div class="details-row">
              <span class="label">Days Until Expiration:</span>
              <span class="value" style="color: ${urgency === 'danger' ? '#EA5455' : '#FF9F43'}; font-weight: 600;">${data.daysUntilExpiration} days</span>
            </div>
          </div>

          <p><strong>Recommended Actions:</strong></p>
          <ul>
            <li>Contact the vendor to request certificate renewal</li>
            <li>Verify updated insurance requirements</li>
            <li>Upload new certificate when received</li>
          </ul>

          <center>
            <a href="${data.certificateUrl}" class="button">View Certificate Details</a>
          </center>

          <div class="footer">
            <p>This is an automated notification from the Columbia University Vendor Compliance Portal.</p>
            <p>If you have questions, please contact the Risk Management office.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

interface NonCompliantData {
  vendorName: string;
  vendorId: string;
  complianceGaps: string[];
  vendorUrl: string;
}

export function nonCompliantNotificationTemplate(data: NonCompliantData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Non-Compliant Certificate</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <div class="logo">Columbia University</div>
            <div style="color: #A8AAAE; font-size: 14px; margin-top: 8px;">Vendor Compliance Portal</div>
          </div>

          <h1>Non-Compliant Insurance Certificate</h1>

          <div class="alert alert-danger">
            <strong>Compliance Issue:</strong> A vendor's insurance certificate does not meet Columbia's requirements.
          </div>

          <p>The following vendor's certificate has been flagged as non-compliant:</p>

          <div class="details">
            <div class="details-row">
              <span class="label">Vendor:</span>
              <span class="value">${data.vendorName}</span>
            </div>
          </div>

          <h2>Compliance Gaps:</h2>
          <ul>
            ${data.complianceGaps.map((gap) => `<li>${gap}</li>`).join('')}
          </ul>

          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Contact the vendor's broker to request corrected certificate</li>
            <li>Review specific requirements with the vendor</li>
            <li>Suspend work authorization until compliance is achieved (if applicable)</li>
          </ul>

          <center>
            <a href="${data.vendorUrl}" class="button">View Vendor Details</a>
          </center>

          <div class="footer">
            <p>This is an automated notification from the Columbia University Vendor Compliance Portal.</p>
            <p>For assistance, contact Risk Management at insurance@columbia.edu</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

interface PendingRequestData {
  vendorName: string;
  brokerEmail: string;
  brokerName: string;
  requestedDate: string;
  daysPending: number;
  vendorUrl: string;
}

export function pendingRequestReminderTemplate(data: PendingRequestData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pending Certificate Request</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <div class="logo">Columbia University</div>
            <div style="color: #A8AAAE; font-size: 14px; margin-top: 8px;">Vendor Compliance Portal</div>
          </div>

          <h1>Pending Certificate Request</h1>

          <div class="alert alert-info">
            <strong>Follow-Up Needed:</strong> An insurance certificate request has been pending for ${data.daysPending} days.
          </div>

          <p>The following certificate request is still awaiting response from the broker:</p>

          <div class="details">
            <div class="details-row">
              <span class="label">Vendor:</span>
              <span class="value">${data.vendorName}</span>
            </div>
            <div class="details-row">
              <span class="label">Broker:</span>
              <span class="value">${data.brokerName || 'Not specified'}</span>
            </div>
            <div class="details-row">
              <span class="label">Broker Email:</span>
              <span class="value">${data.brokerEmail}</span>
            </div>
            <div class="details-row">
              <span class="label">Requested Date:</span>
              <span class="value">${data.requestedDate}</span>
            </div>
            <div class="details-row">
              <span class="label">Days Pending:</span>
              <span class="value" style="color: #FF9F43; font-weight: 600;">${data.daysPending} days</span>
            </div>
          </div>

          <p><strong>Recommended Actions:</strong></p>
          <ul>
            <li>Contact the broker directly at <a href="mailto:${data.brokerEmail}">${data.brokerEmail}</a></li>
            <li>Verify the broker received the original request</li>
            <li>Confirm vendor has necessary insurance in place</li>
            <li>Consider alternate brokers if no response after 14 days</li>
          </ul>

          <center>
            <a href="${data.vendorUrl}" class="button">View Vendor Details</a>
          </center>

          <div class="footer">
            <p>This is an automated notification from the Columbia University Vendor Compliance Portal.</p>
            <p>Certificate requests are sent via Brokermatic integration.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

interface CertificateExpiredData {
  vendorName: string;
  coverageType: string;
  policyNumber: string;
  expirationDate: string;
  daysOverdue: number;
  vendorUrl: string;
}

export function certificateExpiredTemplate(data: CertificateExpiredData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Certificate Expired</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <div class="logo">Columbia University</div>
            <div style="color: #A8AAAE; font-size: 14px; margin-top: 8px;">Vendor Compliance Portal</div>
          </div>

          <h1>Certificate Expired</h1>

          <div class="alert alert-danger">
            <strong>Urgent Action Required:</strong> A vendor insurance certificate has expired.
          </div>

          <p>The following certificate is no longer valid:</p>

          <div class="details">
            <div class="details-row">
              <span class="label">Vendor:</span>
              <span class="value">${data.vendorName}</span>
            </div>
            <div class="details-row">
              <span class="label">Coverage Type:</span>
              <span class="value">${data.coverageType}</span>
            </div>
            <div class="details-row">
              <span class="label">Policy Number:</span>
              <span class="value">${data.policyNumber}</span>
            </div>
            <div class="details-row">
              <span class="label">Expiration Date:</span>
              <span class="value">${data.expirationDate}</span>
            </div>
            <div class="details-row">
              <span class="label">Days Overdue:</span>
              <span class="value" style="color: #EA5455; font-weight: 600;">${data.daysOverdue} days</span>
            </div>
          </div>

          <p><strong>Immediate Actions Required:</strong></p>
          <ul>
            <li><strong>Suspend vendor work authorization immediately</strong></li>
            <li>Contact vendor to request updated certificate</li>
            <li>Verify vendor has active insurance coverage</li>
            <li>Do not authorize new work until certificate is renewed</li>
            <li>Review any active contracts for insurance requirements</li>
          </ul>

          <center>
            <a href="${data.vendorUrl}" class="button">View Vendor Details</a>
          </center>

          <div class="footer">
            <p>This is an automated notification from the Columbia University Vendor Compliance Portal.</p>
            <p><strong>Critical:</strong> Working with uninsured vendors exposes the university to liability.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
