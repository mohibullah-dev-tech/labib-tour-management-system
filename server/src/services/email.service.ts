import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    if (env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE, // true for 465, false for 587
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      this.isConfigured = true;
      logger.info('Email service initialized with SMTP transport', { host: env.SMTP_HOST });
    } else {
      this.isConfigured = false;
      logger.warn(
        'Email service running in simulated/preview mode (SMTP_USER/SMTP_PASS not provided). Emails will be logged to console.',
      );
    }
  }

  /**
   * Internal generic send helper with graceful error resilience.
   */
  private async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    try {
      if (this.isConfigured && this.transporter) {
        const info = await this.transporter.sendMail({
          from: env.EMAIL_FROM,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
        logger.info('Email sent successfully', { to: options.to, messageId: info.messageId });
        return { success: true, messageId: info.messageId };
      } else {
        logger.info(
          `\n================= [SIMULATED EMAIL DISPATCH] =================\nTo: ${options.to}\nSubject: ${options.subject}\nContent:\n${options.text || options.subject}\n=============================================================\n`,
        );
        return { success: true, messageId: 'simulated-' + Date.now() };
      }
    } catch (error) {
      logger.error('Failed to send email', { to: options.to, subject: options.subject, error });
      return { success: false };
    }
  }

  /**
   * Sends an official Welcome & Confirmation Email upon user registration.
   */
  async sendWelcomeEmail(to: string, name: string) {
    const clientUrl = env.CLIENT_URL || 'https://labib-tour-management-system.vercel.app';
    const subject = 'স্বাগতম লাবিব ট্যুরস-এ! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে 🎉';

    const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 12px; }
    .box { background: #f0fdfa; border-left: 4px solid #0d9488; padding: 16px; border-radius: 6px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #0d9488; color: #ffffff !important; text-decoration: none; padding: 12px 28px; font-weight: 600; font-size: 15px; border-radius: 8px; margin: 24px 0; text-align: center; }
    .helpline { border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 24px; font-size: 13px; color: #6b7280; }
    .helpline-item { margin: 4px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Labib Tour & Travels</h1>
      <p>আপনার বিশ্বস্ত ভ্রমণ সঙ্গী</p>
    </div>
    <div class="content">
      <div class="greeting">আসসালামু আলাইকুম, ${name}!</div>
      <p>লাবিব ট্যুরস পরিবারে আপনাকে আন্তরিক স্বাগতম। আপনার অ্যাকাউন্টটি সফলভাবে তৈরি ও সক্রিয় হয়েছে।</p>
      
      <div class="box">
        <strong>আপনার রেজিস্ট্রেশন তথ্য:</strong><br>
        📧 ইমেইল: <code>${to}</code><br>
        🛡️ অ্যাকাউন্টের ধরন: মেম্বার / ট্রাভেলার
      </div>

      <p>এখন থেকে আপনি সহজেই আমাদের যেকোনো ট্যুর প্যাকেজ ঘুরে দেখতে পারেন, বাসের পছন্দসই সিট নির্বাচন করে সরাসরি অগ্রিম বুকিং করতে পারেন এবং ডিজিটাল টিকিট ডাউনলোড করতে পারেন।</p>

      <center>
        <a href="${clientUrl}/tours" class="cta-button" target="_blank">আসন্ন ট্যুর প্যাকেজগুলো দেখুন ↗</a>
      </center>

      <div class="helpline">
        <strong>যেকোনো প্রয়োজনে আমাদের অফিসিয়াল হেল্পলাইনে যোগাযোগ করুন:</strong>
        <div class="helpline-item">📞 লাইন ১: 01602113987 (বুকিং ও অনুসন্ধান)</div>
        <div class="helpline-item">📞 লাইন ২: 01991009767 (কাস্টমার সাপোর্ট)</div>
        <div class="helpline-item">📞 লাইন ৩: 01848474663 (জরুরি হটলাইন)</div>
        <div class="helpline-item">📍 অফিস: সেক্টর ৩, উত্তরা, ঢাকা, বাংলাদেশ</div>
        <div class="helpline-item">🌐 ফেসবুক: <a href="https://www.facebook.com/labibtourgroup/" target="_blank">facebook.com/labibtourgroup</a></div>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Labib Tour & Travels. All rights reserved.<br>
      This is an automated notification. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
    `;

    const text = `আসসালামু আলাইকুম ${name}!\n\nলাবিব ট্যুরস-এ স্বাগতম। আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।\nআপনার ইমেইল: ${to}\n\nআমাদের আসন্ন ট্যুর প্যাকেজগুলো দেখতে ভিজিট করুন: ${clientUrl}/tours\n\nহেল্পলাইন নম্বরসমূহ:\n১. 01602113987\n২. 01991009767\n৩. 01848474663`;

    return this.sendMail({ to, subject, html, text });
  }

  /**
   * Sends a Password Reset Code email.
   */
  async sendPasswordResetEmail(to: string, name: string, code: string) {
    const subject = 'লাবিব ট্যুরস — পাসওয়ার্ড রিসেট ভেরিফিকেশন কোড';
    const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 32px; }
    .header { text-align: center; margin-bottom: 24px; }
    .header h2 { color: #0d9488; margin: 0; font-size: 22px; }
    .code-box { background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 8px; padding: 18px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0f766e; margin: 24px 0; }
    .note { font-size: 13px; color: #6b7280; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Labib Tour & Travels</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">পাসওয়ার্ড রিসেট অনুরোধ</p>
    </div>
    <p>প্রিয় ${name},</p>
    <p>আপনার লাবিব ট্যুরস অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তনের জন্য একটি অনুরোধ করা হয়েছে। আপনার ভেরিফিকেশন কোডটি নিচে দেওয়া হলো:</p>
    
    <div class="code-box">${code}</div>

    <p class="note">⚠️ এই কোডটি আগামী ১৫ মিনিট কার্যকর থাকবে। আপনি যদি এই অনুরোধ না করে থাকেন, তবে অনুগ্রহ করে মেসেজটি উপেক্ষা করুন এবং পাসওয়ার্ড নিরাপদ রাখুন।</p>
  </div>
</body>
</html>
    `;

    const text = `প্রিয় ${name},\n\nআপনার লাবিব ট্যুরস পাসওয়ার্ড রিসেট কোড: ${code}\n\nকোডটির মেয়াদ ১৫ মিনিট।`;
    return this.sendMail({ to, subject, html, text });
  }

  /**
   * Sends Booking Confirmation with ticket summary.
   */
  async sendBookingConfirmationEmail(
    to: string,
    name: string,
    booking: {
      bookingReference: string;
      tourTitle: string;
      departureDate: string;
      seats: string[];
      totalAmount: number;
      paidAmount: number;
      dueAmount: number;
      ticketUrl?: string;
    },
  ) {
    const subject = `বুকিং নিশ্চিত হয়েছে! ট্যুর: ${booking.tourTitle} (Ref: ${booking.bookingReference})`;
    const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: #0d9488; padding: 28px 24px; text-align: center; color: #ffffff; }
    .content { padding: 28px; line-height: 1.6; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .table td:first-child { color: #6b7280; font-weight: 500; width: 40%; }
    .table td:last-child { color: #111827; font-weight: 600; }
    .btn { display: inline-block; background: #0d9488; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">বুকিং কনফার্মেশন স্লিপ</h2>
      <p style="margin: 4px 0 0; opacity: 0.9;">Labib Tour & Travels</p>
    </div>
    <div class="content">
      <p>প্রিয় ${name},</p>
      <p>আপনার ট্যুর বুকিংটি সফলভাবে সম্পন্ন হয়েছে। বুকিংয়ের বিবরণ নিচে দেওয়া হলো:</p>
      
      <table class="table">
        <tr><td>বুকিং রেফারেন্স</td><td>${booking.bookingReference}</td></tr>
        <tr><td>ট্যুরের নাম</td><td>${booking.tourTitle}</td></tr>
        <tr><td>যাত্রার তারিখ</td><td>${booking.departureDate}</td></tr>
        <tr><td>নির্বাচিত সিট</td><td>${booking.seats.join(', ')}</td></tr>
        <tr><td>মোট ভাড়া</td><td>৳${booking.totalAmount.toLocaleString('en-US')}/-</td></tr>
        <tr><td>পরিশোধিত অগ্রিম</td><td><span style="color: #059669;">৳${booking.paidAmount.toLocaleString('en-US')}/-</span></td></tr>
        <tr><td>বকেয়া পরিমাণ</td><td><span style="color: #dc2626;">৳${booking.dueAmount.toLocaleString('en-US')}/-</span></td></tr>
      </table>

      ${
        booking.ticketUrl
          ? `<center><a href="${booking.ticketUrl}" class="btn" target="_blank">ডিজিটাল টিকিট ডাউনলোড করুন 📄</a></center>`
          : ''
      }

      <p style="font-size: 13px; color: #6b7280; margin-top: 24px;">যেকোনো জিজ্ঞাসা বা সহায়তার জন্য আমাদের অফিসিয়াল নম্বরে (01602113987) কল বা হোয়াটসঅ্যাপ করতে পারেন।</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendMail({
      to,
      subject,
      html,
      text: `প্রিয় ${name},\n\nআপনার বুকিং (${booking.bookingReference}) সফল হয়েছে!\nট্যুর: ${booking.tourTitle}\nসিট: ${booking.seats.join(', ')}\nপরিশোধ: ৳${booking.paidAmount}\nবকেয়া: ৳${booking.dueAmount}`,
    });
  }
}

export const emailService = new EmailService();
