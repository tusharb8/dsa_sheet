import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendAccountCreated(email: string, password: string, name: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"DSA Sheet" <noreply@dsasheet.com>',
        to: email,
        subject: 'Your DSA Sheet Account Has Been Created',
        html: `
          <h2>Welcome to DSA Sheet, ${name}!</h2>
          <p>An admin has created an account for you.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p>Please log in and change your password.</p>
        `,
      });
      console.log(`Email sent successfully to ${email}`);
    } catch (err: any) {
      console.warn(`Failed to send email to ${email} —`, err.message);
    }
  }

  async sendPasswordChanged(email: string, newPassword: string, name: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"DSA Sheet" <noreply@dsasheet.com>',
        to: email,
        subject: 'Your DSA Sheet Password Has Been Changed',
        html: `
          <h2>Password Changed, ${name}</h2>
          <p>An admin has reset your password.</p>
          <p><strong>New Password:</strong> ${newPassword}</p>
          <p>Please log in with the new password.</p>
        `,
      });
      console.log(`Password change email sent successfully to ${email}`);
    } catch (err: any) {
      console.warn(`Failed to send password email to ${email} —`, err.message);
    }
  }
}
