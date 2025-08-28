import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, message } = body || {};
    if (!name || !email || !message) return NextResponse.json({ error: 'invalid' }, { status: 400 });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const info = await transporter.sendMail({
      to: process.env.CONTACT_TO,
      from: process.env.CONTACT_FROM,
      subject: `Titan Bot Contact: ${name}`,
      replyTo: email,
      text: message,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`
    });

    return NextResponse.json({ ok: true, id: info.messageId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'send_failed' }, { status: 500 });
  }
}