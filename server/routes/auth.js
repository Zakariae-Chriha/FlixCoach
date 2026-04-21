const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/auth');
const User = require('../models/User');
const nodemailer = require('nodemailer');

function mailer() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.patch('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ success: false, message: 'Both fields required' });
  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  try {
    const user = await User.findById(req.user._id);
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST /api/auth/forgot-password */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'E-Mail-Adresse erforderlich' });

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Always respond OK to prevent user enumeration
    if (!user) return res.json({ success: true, message: 'Wenn diese E-Mail existiert, erhalten Sie einen Link.' });

    // Generate secure random token (valid 1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1h
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await mailer().sendMail({
      from: `"FlixCoach" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Passwort zurücksetzen – FlixCoach',
      html: `
<!DOCTYPE html><html lang="de"><body style="margin:0;font-family:Inter,sans-serif;background:#0f0f17;color:#fff;">
<div style="max-width:480px;margin:40px auto;background:#1a1a27;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
  <div style="background:linear-gradient(135deg,#d946ef,#7c3aed);padding:32px;text-align:center;">
    <div style="width:48px;height:48px;background:rgba(255,255,255,0.15);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff;margin-bottom:12px;">F</div>
    <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;">Passwort zurücksetzen</h1>
  </div>
  <div style="padding:32px;">
    <p style="color:#d1d5db;margin-top:0;">Hallo <strong style="color:#fff;">${user.name}</strong>,</p>
    <p style="color:#9ca3af;line-height:1.6;">Sie haben angefordert, Ihr Passwort bei FlixCoach zurückzusetzen. Klicken Sie auf den Button, um ein neues Passwort festzulegen.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#d946ef,#7c3aed);color:#fff;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;">
        Passwort zurücksetzen
      </a>
    </div>
    <p style="color:#6b7280;font-size:13px;text-align:center;">Dieser Link ist <strong style="color:#9ca3af;">1 Stunde</strong> gültig.</p>
    <p style="color:#6b7280;font-size:12px;text-align:center;margin-bottom:0;">Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.</p>
  </div>
  <div style="padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
    <p style="color:#4b5563;font-size:11px;margin:0;">© 2026 FlixCoach · Deutschland</p>
  </div>
</div>
</body></html>`,
    });

    res.json({ success: true, message: 'Wenn diese E-Mail existiert, erhalten Sie einen Link.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ success: false, message: 'E-Mail konnte nicht gesendet werden. Versuchen Sie es später.' });
  }
});

/* POST /api/auth/reset-password/:token */
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6)
    return res.status(400).json({ success: false, message: 'Passwort muss mindestens 6 Zeichen haben' });

  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Link ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.' });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Passwort erfolgreich geändert. Sie können sich jetzt anmelden.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
