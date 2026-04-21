const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function buildReportEmail(user, report) {
  const ratingColor = report.overallProgressRating >= 7 ? '#22c55e'
    : report.overallProgressRating >= 5 ? '#d946ef' : '#ef4444';

  const wrongItems = (report.whatWentWrong || [])
    .map(item => `<li style="margin-bottom:8px;color:#fca5a5;">${item}</li>`).join('');

  const improvements = (report.top3Improvements || [])
    .map((item, i) => `
      <div style="display:flex;gap:12px;margin-bottom:10px;align-items:flex-start;">
        <span style="background:#1e3a2f;color:#4ade80;border-radius:50%;width:24px;height:24px;
          display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0;">${i+1}</span>
        <p style="margin:0;color:#d1fae5;">${item}</p>
      </div>`).join('');

  const planDays = report.nextWeekPlan || {};
  const dayLabels = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun' };
  const planRows = Object.entries(dayLabels)
    .filter(([key]) => planDays[key])
    .map(([key, label]) => `
      <tr>
        <td style="padding:8px 12px;background:#1e1b4b;border-radius:8px;color:#818cf8;font-weight:bold;white-space:nowrap;">${label}</td>
        <td style="padding:8px 12px;color:#e2e8f0;">${planDays[key]}</td>
      </tr>`).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:16px;
        width:64px;height:64px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:28px;">⚡</span>
      </div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">Weekly Report</h1>
      <p style="color:#9ca3af;margin:8px 0 0;">AI Fitness Coach • Week ${report.weekNumber}</p>
    </div>

    <!-- Greeting -->
    <div style="background:#1a1a2e;border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #2d2d44;">
      <p style="color:#e2e8f0;margin:0;font-size:16px;">
        Hey <strong style="color:#a78bfa;">${user.name}</strong>, here's your weekly accountability report from your AI coach.
      </p>
    </div>

    <!-- Score -->
    <div style="background:#1a1a2e;border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #2d2d44;text-align:center;">
      <p style="color:#9ca3af;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Overall Progress</p>
      <span style="font-size:56px;font-weight:900;color:${ratingColor};">${report.overallProgressRating}</span>
      <span style="color:#9ca3af;font-size:24px;">/10</span>
      <div style="display:flex;justify-content:center;gap:32px;margin-top:16px;">
        <div>
          <p style="color:#9ca3af;margin:0;font-size:11px;">WORKOUTS</p>
          <p style="color:#fff;margin:4px 0 0;font-weight:bold;">${report.workoutsCompleted}/${report.workoutsPlanned}</p>
        </div>
        <div>
          <p style="color:#9ca3af;margin:0;font-size:11px;">AVG CALORIES</p>
          <p style="color:#fff;margin:4px 0 0;font-weight:bold;">${report.avgDailyCalories} kcal</p>
        </div>
        <div>
          <p style="color:#9ca3af;margin:0;font-size:11px;">AVG SLEEP</p>
          <p style="color:#fff;margin:4px 0 0;font-weight:bold;">${report.avgSleepHours}h</p>
        </div>
        <div>
          <p style="color:#9ca3af;margin:0;font-size:11px;">WELLNESS</p>
          <p style="color:#fff;margin:4px 0 0;font-weight:bold;">${report.mentalWellnessScore}/10</p>
        </div>
      </div>
    </div>

    <!-- Summary -->
    ${report.summary ? `
    <div style="background:#1e1b4b;border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #3730a3;">
      <p style="color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:bold;">📋 Coach Summary</p>
      <p style="color:#e2e8f0;margin:0;line-height:1.7;">${report.summary}</p>
    </div>` : ''}

    <!-- What Went Wrong -->
    ${wrongItems ? `
    <div style="background:#2d1515;border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #7f1d1d;">
      <p style="color:#f87171;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:bold;">⚠️ What Went Wrong</p>
      <ul style="margin:0;padding-left:20px;">${wrongItems}</ul>
    </div>` : ''}

    <!-- Top 3 Improvements -->
    ${improvements ? `
    <div style="background:#14271f;border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #14532d;">
      <p style="color:#4ade80;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:bold;">✅ Top 3 Actions for Next Week</p>
      ${improvements}
    </div>` : ''}

    <!-- Next Week Plan -->
    ${planRows ? `
    <div style="background:#1a1a2e;border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #2d2d44;">
      <p style="color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:bold;">📅 Next Week Plan</p>
      <table style="width:100%;border-collapse:separate;border-spacing:0 6px;">${planRows}</table>
    </div>` : ''}

    <!-- Coach Message -->
    ${report.coachMessage ? `
    <div style="background:linear-gradient(135deg,#1e1b4b,#2d1b69);border-radius:16px;padding:24px;margin-bottom:20px;border:1px solid #4c1d95;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:12px;
          width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;">
          <span style="font-size:20px;">⚡</span>
        </div>
        <div>
          <p style="color:#fff;margin:0;font-weight:bold;">Your AI Coach</p>
          <p style="color:#a78bfa;margin:0;font-size:12px;">Personal message</p>
        </div>
      </div>
      <p style="color:#e2e8f0;margin:0;font-style:italic;line-height:1.8;font-size:16px;">"${report.coachMessage}"</p>
    </div>` : ''}

    <!-- Footer -->
    <div style="text-align:center;padding-top:20px;border-top:1px solid #2d2d44;">
      <p style="color:#6b7280;font-size:12px;margin:0;">
        Persona AI Trainer • Your personal AI fitness coach
      </p>
      <p style="color:#4b5563;font-size:11px;margin:8px 0 0;">
        Consistency beats perfection. Show up every day. 🔥
      </p>
    </div>

  </div>
</body>
</html>`;
}

function buildDailyEvalEmail(user, evaluation, completionPct) {
  const emoji = completionPct === 100 ? '🏆' : completionPct >= 70 ? '💪' : completionPct >= 40 ? '⚡' : '📊';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:48px;">${emoji}</span>
      <h1 style="color:#fff;margin:8px 0 0;font-size:22px;">Daily Check-In Complete</h1>
      <p style="color:#9ca3af;margin:8px 0 0;">${completionPct}% of tasks done today</p>
    </div>
    <div style="background:#1e1b4b;border-radius:16px;padding:24px;border:1px solid #3730a3;">
      <p style="color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:bold;">🤖 AI Coach Feedback</p>
      <p style="color:#e2e8f0;margin:0;line-height:1.8;">${evaluation}</p>
    </div>
    <div style="text-align:center;margin-top:20px;">
      <p style="color:#6b7280;font-size:12px;">Persona AI Trainer • Keep going, ${user.name}! 🔥</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendWeeklyReport(user, report) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Persona AI Coach" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `⚡ Your Week ${report.weekNumber} Report — Score: ${report.overallProgressRating}/10`,
    html: buildReportEmail(user, report),
  });
  console.log(`📧 Weekly report sent to ${user.email}`);
}

async function sendDailyEvaluation(user, evaluation, completionPct) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Persona AI Coach" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `${completionPct === 100 ? '🏆 Perfect Day!' : '📊 Daily Check-In'} — ${completionPct}% Complete`,
    html: buildDailyEvalEmail(user, evaluation, completionPct),
  });
  console.log(`📧 Daily evaluation sent to ${user.email}`);
}

// ─── CALENDAR (.ics) ─────────────────────────────────────────────

function formatIcsDate(date, time) {
  const d = new Date(date);
  const [h, m] = time.split(':');
  d.setHours(parseInt(h), parseInt(m), 0, 0);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function generateICS({ title, description, location, date, startTime, endTime, organizerEmail, attendeeEmail, uid }) {
  const dtStart = formatIcsDate(date, startTime);
  const dtEnd   = formatIcsDate(date, endTime);
  const now     = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Persona AI Trainer//Coaching Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}@persona-ai-trainer`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    `ORGANIZER:MAILTO:${organizerEmail}`,
    `ATTENDEE;RSVP=TRUE:MAILTO:${attendeeEmail}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Session reminder — 1 hour',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT1440M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Session reminder — 1 day',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function googleCalendarLink({ title, description, location, date, startTime, endTime }) {
  const dtStart = formatIcsDate(date, startTime);
  const dtEnd   = formatIcsDate(date, endTime);
  const params  = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${dtStart}/${dtEnd}`,
    details: description,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildBookingEmail({ recipientName, role, booking, coach, clientName }) {
  const dateStr = new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const gcLink  = googleCalendarLink({
    title: `Coaching Session — ${role === 'client' ? coach.fullName : clientName}`,
    description: `${booking.duration} min ${booking.sessionType} coaching session\n${booking.notes || ''}`,
    location: booking.sessionType === 'online' ? 'Online (link will be shared)' : (coach.city || 'In-Person'),
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
  });

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="background:linear-gradient(135deg,#059669,#10b981);border-radius:16px;
        width:64px;height:64px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:28px;">📅</span>
      </div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">Session Confirmed!</h1>
      <p style="color:#9ca3af;margin:8px 0 0;">
        ${role === 'client' ? `Your session with ${coach.fullName} is booked` : `New booking from ${clientName}`}
      </p>
    </div>

    <!-- Greeting -->
    <div style="background:#1a1a2e;border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #2d2d44;">
      <p style="color:#e2e8f0;margin:0;font-size:16px;">
        Hey <strong style="color:#a78bfa;">${recipientName}</strong>!
        ${role === 'client'
          ? `Your coaching session has been confirmed. See you soon!`
          : `You have a new client booking. Get ready to coach!`}
      </p>
    </div>

    <!-- Session Details -->
    <div style="background:#1a1a2e;border-radius:16px;padding:24px;margin-bottom:20px;border:1px solid #059669;">
      <p style="color:#34d399;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;font-weight:bold;">📋 Session Details</p>

      <table style="width:100%;border-collapse:separate;border-spacing:0 8px;">
        <tr>
          <td style="color:#9ca3af;font-size:13px;width:40%;">📅 Date</td>
          <td style="color:#fff;font-weight:bold;font-size:14px;">${dateStr}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;font-size:13px;">⏰ Time</td>
          <td style="color:#fff;font-weight:bold;font-size:14px;">${booking.startTime} – ${booking.endTime}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;font-size:13px;">⏱ Duration</td>
          <td style="color:#fff;font-size:14px;">${booking.duration} minutes</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;font-size:13px;">${role === 'client' ? '👤 Coach' : '👤 Client'}</td>
          <td style="color:#a78bfa;font-weight:bold;font-size:14px;">${role === 'client' ? coach.fullName : clientName}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;font-size:13px;">📍 Type</td>
          <td style="color:#fff;font-size:14px;text-transform:capitalize;">${booking.sessionType}${booking.sessionType === 'in-person' ? ` — ${coach.city || ''}` : ''}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;font-size:13px;">💰 Price</td>
          <td style="color:#34d399;font-weight:bold;font-size:14px;">${booking.price}€</td>
        </tr>
        ${booking.notes ? `
        <tr>
          <td style="color:#9ca3af;font-size:13px;">📝 Notes</td>
          <td style="color:#d1d5db;font-size:13px;">${booking.notes}</td>
        </tr>` : ''}
      </table>
    </div>

    <!-- Add to Calendar buttons -->
    <div style="background:#1a1a2e;border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #2d2d44;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;font-weight:bold;">📆 Add to Your Calendar</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="${gcLink}" target="_blank"
          style="background:#4285F4;color:#fff;padding:10px 20px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:bold;display:inline-block;">
          📅 Google Calendar
        </a>
        <span style="background:#2d2d44;color:#a78bfa;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:bold;display:inline-block;">
          📎 iCal / Outlook (see attachment)
        </span>
      </div>
      <p style="color:#6b7280;font-size:11px;margin:12px 0 0;">The .ics file is attached — open it to add to any calendar app</p>
    </div>

    <!-- Reminders -->
    <div style="background:#1c1917;border-radius:16px;padding:16px;margin-bottom:20px;border:1px solid #44403c;">
      <p style="color:#fbbf24;font-size:12px;font-weight:bold;margin:0 0 8px;">🔔 Automatic Reminders</p>
      <p style="color:#d6d3d1;font-size:12px;margin:0;">You will be reminded 24 hours and 1 hour before your session automatically (via calendar).</p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:20px;border-top:1px solid #2d2d44;">
      <p style="color:#6b7280;font-size:12px;margin:0;">Persona AI Trainer • Professional Coaching Platform</p>
    </div>

  </div>
</body>
</html>`;
}

async function sendBookingConfirmation({ clientUser, coachDoc, booking }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const transporter = createTransporter();

  const icsData = generateICS({
    title: `Coaching Session — ${coachDoc.fullName}`,
    description: `${booking.duration} min ${booking.sessionType} session with ${coachDoc.fullName}\nSpecialty: ${coachDoc.mainSpecialty}\n${booking.notes || ''}`,
    location: booking.sessionType === 'online' ? 'Online (link to be shared by coach)' : (coachDoc.city || 'In-Person'),
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    organizerEmail: coachDoc.email,
    attendeeEmail: clientUser.email,
    uid: booking._id.toString(),
  });

  const attachment = [{ filename: 'session.ics', content: icsData, contentType: 'text/calendar' }];

  // Email to client
  await transporter.sendMail({
    from: `"Persona AI Trainer" <${process.env.EMAIL_USER}>`,
    to: clientUser.email,
    subject: `📅 Session Confirmed — ${coachDoc.fullName} on ${new Date(booking.date).toLocaleDateString()}`,
    html: buildBookingEmail({ recipientName: clientUser.name, role: 'client', booking, coach: coachDoc, clientName: clientUser.name }),
    attachments: attachment,
  });

  // Email to coach
  await transporter.sendMail({
    from: `"Persona AI Trainer" <${process.env.EMAIL_USER}>`,
    to: coachDoc.email,
    subject: `🆕 New Booking from ${clientUser.name} — ${new Date(booking.date).toLocaleDateString()}`,
    html: buildBookingEmail({ recipientName: coachDoc.fullName, role: 'coach', booking, coach: coachDoc, clientName: clientUser.name }),
    attachments: attachment,
  });

  console.log(`📧 Booking emails sent to ${clientUser.email} and ${coachDoc.email}`);
}

async function sendCoachApprovalEmail(coach, tempPassword) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const transporter = createTransporter();
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="background:linear-gradient(135deg,#059669,#10b981);border-radius:16px;
        width:64px;height:64px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:28px;">🎉</span>
      </div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">You're Approved!</h1>
      <p style="color:#9ca3af;margin:8px 0 0;">Welcome to the Persona AI Trainer Coach Team</p>
    </div>

    <div style="background:#1a1a2e;border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #059669;">
      <p style="color:#e2e8f0;margin:0;font-size:16px;line-height:1.7;">
        Congratulations <strong style="color:#34d399;">${coach.fullName}</strong>! 🏆<br><br>
        Your application has been reviewed and <strong style="color:#34d399;">approved</strong>.
        You are now an official coach on our platform. Clients can already find your profile and book sessions with you!
      </p>
    </div>

    <div style="background:#1e1b4b;border-radius:16px;padding:24px;margin-bottom:20px;border:1px solid #3730a3;">
      <p style="color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;font-weight:bold;">🔐 Your Login Credentials</p>
      <table style="width:100%;border-collapse:separate;border-spacing:0 8px;">
        <tr>
          <td style="color:#9ca3af;font-size:13px;width:35%;">🌐 Platform URL</td>
          <td style="color:#a78bfa;font-weight:bold;">http://localhost:5173/login</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;font-size:13px;">📧 Email</td>
          <td style="color:#fff;font-weight:bold;">${coach.email}</td>
        </tr>
        <tr>
          <td style="color:#9ca3af;font-size:13px;">🔑 Password</td>
          <td style="background:#2d2d44;color:#fbbf24;font-weight:bold;padding:8px 12px;border-radius:8px;font-family:monospace;font-size:16px;letter-spacing:2px;">${tempPassword}</td>
        </tr>
      </table>
      <p style="color:#6b7280;font-size:12px;margin:16px 0 0;">⚠️ Please change your password after first login.</p>
    </div>

    <div style="background:#1a1a2e;border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #2d2d44;">
      <p style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:bold;">✅ What you can do now</p>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${['View your coach profile on the platform', 'See incoming booking requests', 'Manage your weekly availability', 'Track your sessions and earnings', 'Receive booking confirmation emails'].map(item => `
        <div style="display:flex;gap:10px;align-items:center;">
          <span style="color:#34d399;font-size:16px;">✓</span>
          <span style="color:#d1d5db;font-size:13px;">${item}</span>
        </div>`).join('')}
      </div>
    </div>

    <div style="text-align:center;padding-top:20px;border-top:1px solid #2d2d44;">
      <p style="color:#6b7280;font-size:12px;margin:0;">Persona AI Trainer • Professional Coaching Platform</p>
      <p style="color:#4b5563;font-size:11px;margin:8px 0 0;">Welcome to the team! Let's change lives together. 💪</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Persona AI Trainer" <${process.env.EMAIL_USER}>`,
    to: coach.email,
    subject: '🎉 Congratulations! Your Coach Application is Approved',
    html,
  });
  console.log(`📧 Approval email sent to ${coach.email}`);
}

async function sendCoachRejectionEmail(coach, adminNote) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Persona AI Trainer" <${process.env.EMAIL_USER}>`,
    to: coach.email,
    subject: 'Update on Your Coach Application — Persona AI Trainer',
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#1a1a2e;border-radius:16px;padding:24px;border:1px solid #7f1d1d;">
      <h2 style="color:#f87171;margin:0 0 16px;">Application Update</h2>
      <p style="color:#e2e8f0;line-height:1.7;">Dear <strong>${coach.fullName}</strong>,<br><br>
        Thank you for applying. After careful review, we are unable to approve your application at this time.
        ${adminNote ? `<br><br><strong style="color:#fca5a5;">Reason:</strong> ${adminNote}` : ''}
        <br><br>You are welcome to apply again in the future.
      </p>
    </div>
    <p style="color:#6b7280;font-size:12px;text-align:center;margin-top:20px;">Persona AI Trainer Team</p>
  </div>
</body></html>`,
  });
}

module.exports = { sendWeeklyReport, sendDailyEvaluation, sendBookingConfirmation, sendCoachApprovalEmail, sendCoachRejectionEmail };
