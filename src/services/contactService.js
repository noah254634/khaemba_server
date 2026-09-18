import Message from '../models/Message.js';
import nodemailer from 'nodemailer';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Save message to DB + send email notification
export const submitContact = async ({ name, email, subject, body }) => {
  // Validate
  if (!name || !email || !subject || !body)
    throw Object.assign(new Error('All fields are required.'), { status: 400 });
  if (!isValidEmail(email))
    throw Object.assign(new Error('Invalid email address.'), { status: 400 });
  if (body.length > 5000)
    throw Object.assign(new Error('Message too long.'), { status: 400 });

  // Persist
  const message = await Message.create({ name, email, subject, body });

  // Email (best-effort)
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"Portfolio" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      html: `
        <div style="font-family:monospace;background:#0D1117;color:#E8EAF0;padding:24px;border-radius:8px;">
          <h2 style="color:#00D4FF;">New Message — Noah Khaemba Portfolio</h2>
          <p><strong>FROM:</strong> ${name} &lt;${email}&gt;</p>
          <p><strong>SUBJECT:</strong> ${subject}</p>
          <hr style="border-color:#2D3748;" />
          <p style="white-space:pre-wrap;">${body}</p>
        </div>`,
    });
  } catch (mailErr) {
    console.error('Email send failed (non-critical):', mailErr.message);
  }

  return message;
};
