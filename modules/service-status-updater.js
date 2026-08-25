// ═══════════════════════════════════════════════════════════════════════════
// DIGICAFE SERVICE STATUS UPDATER
// Admin tool to send bulk status updates to clients
// ═══════════════════════════════════════════════════════════════════════════

// ═══ LOAD SERVICE REQUESTS ═══
function loadServiceRequests() {
  const container = document.getElementById('status-updater-requests');
  if (!container || !window._adminRequests) return;

  const requests = window._adminRequests || [];
  
  if (requests.length === 0) {
    container.innerHTML = '<p style="color:var(--txt3);padding:2rem">No service requests yet</p>';
    return;
  }

  container.innerHTML = `
    <div style="overflow-x:auto">
      <table class="table">
        <thead>
          <tr>
            <th><input type="checkbox" id="select-all-requests" onchange="toggleAllRequests()"></th>
            <th>Client Name</th>
            <th>Service</th>
            <th>Status</th>
            <th>Date</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          ${requests.map(r => `
            <tr>
              <td>
                <input type="checkbox" class="request-checkbox" data-id="${r.id}" data-email="${r.userEmail || r.email}">
              </td>
              <td>${r.name || '—'}</td>
              <td>${r.service || r.category || 'Service'}</td>
              <td>
                <span class="badge badge-blue">${r.status || 'Received'}</span>
              </td>
              <td>${r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('en-IN') : '—'}</td>
              <td style="font-size:.8rem">${r.userEmail || r.email || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function toggleAllRequests() {
  const checked = document.getElementById('select-all-requests').checked;
  document.querySelectorAll('.request-checkbox').forEach(cb => cb.checked = checked);
  updateSelectedCount();
}

function updateSelectedCount() {
  const count = document.querySelectorAll('.request-checkbox:checked').length;
  const el = document.getElementById('selected-count');
  if (el) el.textContent = count;
}

// ═══ EMAIL TEMPLATE PRESETS ═══
const emailTemplates = {
  'in-progress': {
    subject: 'Your Service Request - In Progress',
    body: `Dear {CLIENT_NAME},

Thank you for choosing DigiCafe for your {SERVICE} needs.

🔄 **Current Status: In Progress**

We are actively working on your request. Here's where we are:

**Application Details:**
- Service: {SERVICE}
- Request ID: {REQUEST_ID}
- Submitted: {SUBMITTED_DATE}
- Current Status: {STATUS}

**Next Steps:**
1. Our team is processing your application
2. We will collect any additional documents if needed
3. Expected completion: {COMPLETION_DATE}

**What We Need From You:**
- {REQUIRED_DOCS}

**How to Stay Updated:**
- WhatsApp: +91 85399 79271
- Email: digicafe.admin@gmail.com
- Call: +91 85399 79271

Questions? Reply to this email or contact us anytime.

Best regards,
DigiCafe Team
India's #1 Tax & Compliance Platform
UDYAM: UDYAM-KR-02-0041919`
  },
  
  'document-pending': {
    subject: 'Action Required: Documents Needed for Your {SERVICE}',
    body: `Dear {CLIENT_NAME},

We're ready to proceed with your {SERVICE}! 

📋 **Action Required: Please Submit Documents**

To expedite your application, we need the following documents from you:

**Required Documents:**
{REQUIRED_DOCS}

**How to Submit:**
1. WhatsApp: +91 85399 79271 (Fastest)
2. Email: digicafe.admin@gmail.com
3. Upload: https://vikashp23.github.io/digicafe/#page-digital

**Submission Deadline:** {DEADLINE}

Once we receive your documents, we can:
- Complete your application immediately
- Get you registered/filed
- Send you the certificates/acknowledgments

**Your Request Details:**
- Service: {SERVICE}
- Reference: {REQUEST_ID}
- Current Status: Awaiting Documents

Please submit at your earliest convenience. Questions? Contact us anytime!

Best regards,
DigiCafe Team`
  },

  'completed': {
    subject: '✅ Your {SERVICE} is Complete!',
    body: `Dear {CLIENT_NAME},

Great news! Your {SERVICE} has been successfully completed! 🎉

**✅ Completion Details:**

- Service: {SERVICE}
- Reference: {REQUEST_ID}
- Status: Completed
- Completion Date: {COMPLETION_DATE}

**What You Can Do Next:**

1. **Download Your Documents:**
   - Certificates/Acknowledgments
   - Registration confirmations
   - Filed documents

2. **Track Your Application:**
   - Visit: https://vikashp23.github.io/digicafe/
   - Call us for detailed reports

3. **Need More Help?**
   - AMC/Compliance Services
   - Renewal reminders
   - Next-step guidance

**Your Service Includes:**
{ADDITIONAL_INFO}

**Questions or Need Clarification?**
- WhatsApp: +91 85399 79271
- Email: digicafe.admin@gmail.com
- Call: +91 85399 79271

Thank you for choosing DigiCafe!

Best regards,
Vikash Pathak
DigiCafe Compliance & Digital Solutions
UDYAM: UDYAM-KR-02-0041919`
  },

  'follow-up': {
    subject: 'Quick Update on Your {SERVICE}',
    body: `Hi {CLIENT_NAME},

Just wanted to check in on your {SERVICE} application.

**Status Update:**
- Service: {SERVICE}
- Current Status: {STATUS}
- Last Update: {LAST_UPDATE}

**Next Steps:**
{NEXT_STEPS}

**Expected Timeline:**
{TIMELINE}

If you have any questions or need to discuss anything, reach out anytime:
- WhatsApp: +91 85399 79271
- Email: digicafe.admin@gmail.com

Thanks!

DigiCafe Team`
  }
};

// ═══ POPULATE TEMPLATE DROPDOWN ═══
function populateTemplates() {
  const sel = document.getElementById('email-template-select');
  if (!sel) return;
  
  sel.innerHTML = '<option value="">Custom Message</option>' + 
    Object.keys(emailTemplates).map(key => 
      `<option value="${key}">${emailTemplates[key].subject}</option>`
    ).join('');
}

// ═══ SELECT TEMPLATE ═══
function selectTemplate(templateKey) {
  if (!templateKey) {
    document.getElementById('email-subject').value = '';
    document.getElementById('email-body').value = '';
    return;
  }
  
  const template = emailTemplates[templateKey];
  if (template) {
    document.getElementById('email-subject').value = template.subject;
    document.getElementById('email-body').value = template.body;
  }
}

// ═══ GET SELECTED RECIPIENTS ═══
function getSelectedRecipients() {
  const checkboxes = document.querySelectorAll('.request-checkbox:checked');
  const recipients = [];
  
  checkboxes.forEach(cb => {
    recipients.push({
      id: cb.dataset.id,
      email: cb.dataset.email
    });
  });
  
  return recipients;
}

// ═══ PREVIEW EMAIL ═══
function previewEmail() {
  const recipients = getSelectedRecipients();
  
  if (recipients.length === 0) {
    showToast('⚠ Select at least one recipient');
    return;
  }
  
  const subject = document.getElementById('email-subject').value;
  const body = document.getElementById('email-body').value;
  
  if (!subject || !body) {
    showToast('⚠ Enter subject and body');
    return;
  }
  
  const preview = document.getElementById('email-preview');
  preview.innerHTML = `
    <div style="background:var(--bg3);border:1px solid var(--bdr);border-radius:var(--r2);padding:1.5rem">
      <div style="margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--bdr)">
        <div style="font-size:.8rem;color:var(--txt3)">TO: ${recipients.length} recipient(s)</div>
        <div style="font-weight:700;margin-top:.5rem">📧 ${subject}</div>
      </div>
      <div style="white-space:pre-wrap;font-size:.9rem;line-height:1.6;color:var(--txt2);font-family:'JetBrains Mono',monospace;max-height:300px;overflow-y:auto">
${body}
      </div>
    </div>
  `;
  
  document.getElementById('preview-container').scrollIntoView({behavior:'smooth',block:'start'});
}

// ═══ SEND EMAILS ═══
async function sendStatusEmails() {
  const recipients = getSelectedRecipients();
  
  if (recipients.length === 0) {
    showToast('⚠ Select at least one recipient');
    return;
  }
  
  const subject = document.getElementById('email-subject').value;
  const body = document.getElementById('email-body').value;
  const scheduleTime = document.getElementById('email-schedule').value;
  
  if (!subject || !body) {
    showToast('⚠ Enter subject and body');
    return;
  }
  
  if (!confirm(`Send to ${recipients.length} recipient(s)? This cannot be undone.`)) {
    return;
  }
  
  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  
  try {
    // Queue emails for sending
    for (const recipient of recipients) {
      await window.queueAdminEmail(
        subject,
        `TO: ${recipient.email}\n\n${body}`,
        recipient.id,
        scheduleTime
      );
    }
    
    showToast(`✓ ${recipients.length} email(s) queued for sending`);
    
    // Clear form
    document.getElementById('email-subject').value = '';
    document.getElementById('email-body').value = '';
    document.getElementById('select-all-requests').checked = false;
    document.querySelectorAll('.request-checkbox').forEach(cb => cb.checked = false);
    updateSelectedCount();
    loadServiceRequests();
    
  } catch (err) {
    console.error('Email send error:', err);
    showToast('⚠ Error sending emails: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Emails';
  }
}

// ═══ BULK ACTIONS ═══
function bulkUpdateStatus() {
  const recipients = getSelectedRecipients();
  if (recipients.length === 0) {
    showToast('⚠ Select at least one request');
    return;
  }
  
  const status = document.getElementById('bulk-status-select').value;
  if (!status) {
    showToast('⚠ Select a status');
    return;
  }
  
  recipients.forEach(r => {
    if (window._updateRequestStatus) {
      window._updateRequestStatus(r.id, status);
    }
  });
  
  showToast(`✓ Updated ${recipients.length} request(s) to ${status}`);
  setTimeout(() => loadServiceRequests(), 1000);
}

// ═══ EXPORT DATA ═══
function exportToCSV() {
  const requests = window._adminRequests || [];
  if (requests.length === 0) {
    showToast('⚠ No requests to export');
    return;
  }
  
  let csv = 'Name,Email,Phone,Service,Category,Status,Date,Urgency,Notes\n';
  
  requests.forEach(r => {
    csv += `"${r.name || ''}","${r.userEmail || r.email || ''}","${r.mobile || ''}","${r.service || ''}","${r.category || ''}","${r.status || ''}","${r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('en-IN') : ''}","${r.urgency || ''}","${(r.notes || '').replace(/"/g, '""')}"\n`;
  });
  
  const blob = new Blob([csv], {type:'text/csv'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'service-requests-' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  
  showToast('✓ Exported to CSV');
}

console.log('✓ Service Status Updater Module Loaded');
