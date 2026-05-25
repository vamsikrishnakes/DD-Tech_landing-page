// ─── DD Tech Academy — Enrollment Backend ───────────────────────────────────
// Deploy this as a Google Apps Script Web App (see README below)
//
// SETUP STEPS:
//  1. Go to https://sheets.google.com → create a new sheet named "Enrollments"
//  2. Click Extensions → Apps Script
//  3. Paste this entire file, save (Ctrl+S)
//  4. Click Deploy → New Deployment → Web App
//     - Execute as: Me
//     - Who has access: Anyone
//  5. Copy the Web App URL and paste it into index.html (SCRIPT_URL constant)
//  6. Run setupDailyDigest() ONCE manually to register the daily trigger
// ─────────────────────────────────────────────────────────────────────────────

var SHEET_NAME   = 'Enrollments';
var NOTIFY_EMAIL = 'vamsikrishnakesari@gmail.com';
var DIGEST_HOUR  = 8; // 8 AM in your timezone

// ── Receive form POST ────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Full Name', 'Email', 'Phone',
        'Course', 'Background', 'Message'
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold')
           .setBackground('#1a2a5e').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      data.name       || '',
      data.email      || '',
      data.phone      || '',
      data.course     || '',
      data.experience || '',
      data.message    || ''
    ]);

    // Send instant notification email
    sendInstantNotification(data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Instant email on every new enrollment ────────────────────────────────────
function sendInstantNotification(data) {
  var now      = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMM dd, yyyy — hh:mm a');
  var msgBlock = data.message
    ? '<tr><td style="padding:10px 16px;color:#6b7280;font-weight:600;width:140px">Message</td><td style="padding:10px 16px">' + data.message + '</td></tr>'
    : '';

  var html =
    '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f4f6fb;padding:20px">' +

    '<div style="background:linear-gradient(135deg,#0f1e4a,#1a2a5e);border-radius:12px 12px 0 0;padding:24px 28px;display:flex;align-items:center;gap:14px">' +
      '<div style="background:#f5a623;border-radius:8px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;flex-shrink:0">DD</div>' +
      '<div>' +
        '<div style="font-size:16px;font-weight:900;color:#fff">DD Tech Academy</div>' +
        '<div style="color:rgba(255,255,255,.6);font-size:12px">New Enrollment Received</div>' +
      '</div>' +
    '</div>' +

    '<div style="background:#fff;padding:0">' +
      '<div style="background:#22c55e;padding:14px 28px;display:flex;align-items:center;gap:10px">' +
        '<span style="font-size:22px">🎉</span>' +
        '<span style="font-size:15px;font-weight:800;color:#fff">You have a new enrollment!</span>' +
      '</div>' +

      '<table style="width:100%;border-collapse:collapse;font-size:14px">' +
        '<tr style="background:#f4f6fb">' +
          '<td style="padding:12px 16px;color:#6b7280;font-weight:600;width:140px">Name</td>' +
          '<td style="padding:12px 16px;font-weight:700;color:#1a2a5e">' + (data.name || '—') + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:12px 16px;color:#6b7280;font-weight:600">Email</td>' +
          '<td style="padding:12px 16px"><a href="mailto:' + data.email + '" style="color:#1a2a5e;font-weight:700">' + (data.email || '—') + '</a></td>' +
        '</tr>' +
        '<tr style="background:#f4f6fb">' +
          '<td style="padding:12px 16px;color:#6b7280;font-weight:600">Phone</td>' +
          '<td style="padding:12px 16px;font-weight:700">' + (data.phone || '—') + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:12px 16px;color:#6b7280;font-weight:600">Course</td>' +
          '<td style="padding:12px 16px"><span style="background:#f5a623;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:800">' + (data.course || '—') + '</span></td>' +
        '</tr>' +
        '<tr style="background:#f4f6fb">' +
          '<td style="padding:12px 16px;color:#6b7280;font-weight:600">Background</td>' +
          '<td style="padding:12px 16px">' + (data.experience || '—') + '</td>' +
        '</tr>' +
        msgBlock +
        '<tr>' +
          '<td style="padding:12px 16px;color:#6b7280;font-weight:600">Received At</td>' +
          '<td style="padding:12px 16px;color:#6b7280;font-size:12px">' + now + '</td>' +
        '</tr>' +
      '</table>' +
    '</div>' +

    '<div style="background:#fff;border-top:2px solid #f4f6fb;padding:18px 28px;text-align:center;border-radius:0 0 12px 12px">' +
      '<a href="mailto:' + data.email + '" style="display:inline-block;background:#1a2a5e;color:#fff;padding:11px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:13px;margin-right:10px">✉️ Reply to Student</a>' +
      '<a href="tel:' + data.phone + '" style="display:inline-block;background:#f5a623;color:#fff;padding:11px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:13px">📞 Call Now</a>' +
    '</div>' +

    '<div style="text-align:center;padding:16px;color:#9ca3af;font-size:11px">DD Tech Academy — Automated Notification</div>' +
    '</div>';

  MailApp.sendEmail({
    to:       NOTIFY_EMAIL,
    subject:  '🎓 New Enrollment: ' + (data.name || 'Someone') + ' — ' + (data.course || 'Unknown Course'),
    htmlBody: html
  });
}

// Handle CORS preflight
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'DD Tech Academy Enrollments' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Daily Digest Email ───────────────────────────────────────────────────────
function sendDailyDigest() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    MailApp.sendEmail({
      to:      NOTIFY_EMAIL,
      subject: 'DD Tech Academy — No Enrollments Sheet Found',
      body:    'The Enrollments sheet was not found. Please check your setup.'
    });
    return;
  }

  var allData = sheet.getDataRange().getValues();
  if (allData.length <= 1) {
    sendNoEnrollmentEmail();
    return;
  }

  // Filter today's rows (skip header row at index 0)
  var today     = new Date();
  var todayStr  = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var todayRows = allData.slice(1).filter(function(row) {
    var rowDate = Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    return rowDate === todayStr;
  });

  if (todayRows.length === 0) {
    sendNoEnrollmentEmail();
    return;
  }

  // Build HTML email
  var dateLabel = Utilities.formatDate(today, Session.getScriptTimeZone(), 'MMMM dd, yyyy');
  var rows = todayRows.map(function(r, i) {
    var ts = r[0] instanceof Date
      ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), 'hh:mm a')
      : r[0];
    return '<tr style="background:' + (i % 2 === 0 ? '#f4f6fb' : '#ffffff') + '">' +
      '<td style="padding:10px 14px;border-bottom:1px solid #dde3f0">' + (i + 1) + '</td>' +
      '<td style="padding:10px 14px;border-bottom:1px solid #dde3f0;font-weight:600">' + r[1] + '</td>' +
      '<td style="padding:10px 14px;border-bottom:1px solid #dde3f0"><a href="mailto:' + r[2] + '" style="color:#1a2a5e">' + r[2] + '</a></td>' +
      '<td style="padding:10px 14px;border-bottom:1px solid #dde3f0">' + r[3] + '</td>' +
      '<td style="padding:10px 14px;border-bottom:1px solid #dde3f0"><span style="background:#f5a623;color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">' + r[4] + '</span></td>' +
      '<td style="padding:10px 14px;border-bottom:1px solid #dde3f0;color:#6b7280;font-size:12px">' + r[5] + '</td>' +
      '<td style="padding:10px 14px;border-bottom:1px solid #dde3f0;color:#6b7280;font-size:12px">' + ts + '</td>' +
    '</tr>';
  }).join('');

  // Course breakdown
  var courseCount = {};
  todayRows.forEach(function(r) {
    courseCount[r[4]] = (courseCount[r[4]] || 0) + 1;
  });
  var courseBreakdown = Object.keys(courseCount).map(function(c) {
    return '<div style="display:inline-block;margin:4px;background:#1a2a5e;color:#fff;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700">' +
      c + ' <span style="color:#f5a623">(' + courseCount[c] + ')</span></div>';
  }).join('');

  var html =
    '<div style="font-family:Arial,sans-serif;max-width:900px;margin:0 auto;background:#f4f6fb;padding:20px">' +

    // Header
    '<div style="background:linear-gradient(135deg,#0f1e4a,#1a2a5e);border-radius:12px 12px 0 0;padding:28px 32px;text-align:center">' +
      '<div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:1px">DD <span style="color:#f5a623">TECH</span> ACADEMY</div>' +
      '<div style="color:rgba(255,255,255,.6);font-size:13px;margin-top:6px">Daily Enrollment Digest — ' + dateLabel + '</div>' +
    '</div>' +

    // Stats bar
    '<div style="background:#fff;padding:20px 32px;display:flex;gap:20px;border-bottom:2px solid #f4f6fb">' +
      '<div style="text-align:center;flex:1">' +
        '<div style="font-size:32px;font-weight:900;color:#1a2a5e">' + todayRows.length + '</div>' +
        '<div style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase">New Enrollments Today</div>' +
      '</div>' +
      '<div style="text-align:center;flex:1">' +
        '<div style="font-size:32px;font-weight:900;color:#f5a623">' + (allData.length - 1) + '</div>' +
        '<div style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase">Total Enrollments</div>' +
      '</div>' +
      '<div style="text-align:center;flex:1">' +
        '<div style="font-size:32px;font-weight:900;color:#22c55e">' + Object.keys(courseCount).length + '</div>' +
        '<div style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase">Courses Interested</div>' +
      '</div>' +
    '</div>' +

    // Course breakdown
    '<div style="background:#fff;padding:16px 32px;border-bottom:2px solid #f4f6fb">' +
      '<div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:10px">Course Breakdown</div>' +
      courseBreakdown +
    '</div>' +

    // Table
    '<div style="background:#fff;border-radius:0 0 12px 12px;overflow:hidden">' +
      '<table style="width:100%;border-collapse:collapse;font-size:13px">' +
        '<thead>' +
          '<tr style="background:#1a2a5e;color:#fff">' +
            '<th style="padding:12px 14px;text-align:left;font-weight:700">#</th>' +
            '<th style="padding:12px 14px;text-align:left;font-weight:700">Name</th>' +
            '<th style="padding:12px 14px;text-align:left;font-weight:700">Email</th>' +
            '<th style="padding:12px 14px;text-align:left;font-weight:700">Phone</th>' +
            '<th style="padding:12px 14px;text-align:left;font-weight:700">Course</th>' +
            '<th style="padding:12px 14px;text-align:left;font-weight:700">Background</th>' +
            '<th style="padding:12px 14px;text-align:left;font-weight:700">Time</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>' +
    '</div>' +

    // Footer
    '<div style="text-align:center;padding:20px;color:#6b7280;font-size:12px">' +
      'This is an automated daily digest from DD Tech Academy.<br/>' +
      'Sent to ' + NOTIFY_EMAIL + ' every day at ' + DIGEST_HOUR + ':00 AM.' +
    '</div>' +

    '</div>';

  MailApp.sendEmail({
    to:       NOTIFY_EMAIL,
    subject:  '📊 DD Tech Academy — ' + todayRows.length + ' New Enrollment' +
              (todayRows.length > 1 ? 's' : '') + ' Today (' + dateLabel + ')',
    htmlBody: html
  });

  Logger.log('Daily digest sent: ' + todayRows.length + ' enrollment(s)');
}

function sendNoEnrollmentEmail() {
  var dateLabel = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM dd, yyyy');
  var html =
    '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f6fb;padding:20px">' +
    '<div style="background:linear-gradient(135deg,#0f1e4a,#1a2a5e);border-radius:12px 12px 0 0;padding:28px 32px;text-align:center">' +
      '<div style="font-size:24px;font-weight:900;color:#fff">DD <span style="color:#f5a623">TECH</span> ACADEMY</div>' +
      '<div style="color:rgba(255,255,255,.6);font-size:13px;margin-top:6px">Daily Digest — ' + dateLabel + '</div>' +
    '</div>' +
    '<div style="background:#fff;border-radius:0 0 12px 12px;padding:40px;text-align:center">' +
      '<div style="font-size:48px;margin-bottom:16px">📭</div>' +
      '<div style="font-size:18px;font-weight:700;color:#1a2a5e;margin-bottom:8px">No Enrollments Today</div>' +
      '<div style="color:#6b7280;font-size:14px">No new enrollments were received on ' + dateLabel + '.</div>' +
    '</div></div>';

  MailApp.sendEmail({
    to:       NOTIFY_EMAIL,
    subject:  'DD Tech Academy — No Enrollments on ' + dateLabel,
    htmlBody: html
  });
}

// ── Register daily trigger (run this ONCE manually) ──────────────────────────
function setupDailyDigest() {
  // Delete any existing digest triggers first
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'sendDailyDigest') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('sendDailyDigest')
    .timeBased()
    .everyDays(1)
    .atHour(DIGEST_HOUR)
    .create();

  Logger.log('Daily digest trigger set for ' + DIGEST_HOUR + ':00 AM every day.');
}
