import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import prisma from '../config/database';
import { emailTemplates } from '../templates/emailTemplates';
import logger from '../config/logger';

export interface SendEmailOptions {
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  templateId?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const DEFAULT_FROM = 'info@dntech.id';

function frontendBase() {
  return (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim();
}

function fromAddress() {
  const name = process.env.SMTP_FROM_NAME || 'DN Tech';
  const email = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || DEFAULT_FROM;
  return `${name} <${email}>`;
}

function adminEmail() {
  return process.env.ADMIN_EMAIL || process.env.SALES_EMAIL || DEFAULT_FROM;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly maxRetries = Number(process.env.EMAIL_RETRY_ATTEMPTS || 3);
  private readonly retryDelay = Number(process.env.EMAIL_RETRY_DELAY_MS || 1000);

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!user || !pass) {
      logger.warn('[Email] SMTP credentials are not configured. Emails will be logged as skipped.');
      return;
    }

    const transportOptions = {
      host: process.env.SMTP_HOST || 'mx8.mailspace.id',
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== 'false',
      family: Number(process.env.SMTP_FAMILY || 4),
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 15000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 15000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: Number(process.env.EMAIL_RATE_LIMIT || 10),
    };

    this.transporter = nodemailer.createTransport(transportOptions as SMTPTransport.Options);

    this.transporter?.verify((error) => {
      if (error) {
        logger.error({ err: error }, '[Email] SMTP connection failed');
        return;
      }
      logger.info('[Email] SMTP server ready for info@dntech.id');
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    options: SendEmailOptions = {},
  ): Promise<EmailResult> {
    const from = fromAddress();
    const log = await prisma.emailLog.create({
      data: {
        to,
        from,
        subject,
        templateId: options.templateId,
        status: this.transporter ? 'pending' : 'skipped',
      },
    });

    if (!this.transporter) {
      logger.info(`[Email:skipped] ${subject} -> ${to}`);
      return { success: false, error: 'SMTP credentials are not configured' };
    }

    try {
      const result = await this.transporter.sendMail({
        from,
        to,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || DEFAULT_FROM,
        subject,
        html,
        text: this.stripHtml(html),
      });

      await prisma.emailLog.update({
        where: { id: log.id },
        data: { status: 'sent', messageId: result.messageId, sentAt: new Date() },
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown email error';
      await prisma.emailLog.update({
        where: { id: log.id },
        data: { status: 'failed', error: message },
      });
      logger.error({ err: error }, `[Email] Failed sending ${subject} -> ${to}`);
      return { success: false, error: message };
    }
  }

  async sendEmailWithRetry(
    to: string,
    subject: string,
    html: string,
    options: SendEmailOptions = {},
  ): Promise<EmailResult> {
    if (!this.transporter) {
      return this.sendEmail(to, subject, html, options);
    }

    let lastResult: EmailResult = { success: false, error: 'Not attempted' };

    for (let attempt = 1; attempt <= this.maxRetries; attempt += 1) {
      lastResult = await this.sendEmail(to, subject, html, options);
      if (lastResult.success) return lastResult;
      if (attempt < this.maxRetries) await this.delay(this.retryDelay);
    }

    return {
      success: false,
      error: `Failed after ${this.maxRetries} attempts: ${lastResult.error}`,
    };
  }

  async sendBulkEmail(recipients: string[], subject: string, html: string, options?: SendEmailOptions) {
    return Promise.all(recipients.map((to) => this.sendEmailWithRetry(to, subject, html, options)));
  }

  private stripHtml(html: string) {
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const emailService = new EmailService();

export async function sendWelcomeEmail(to: string, name: string, projectType?: string) {
  const template = emailTemplates.formConfirmation(name, projectType);
  return emailService.sendEmailWithRetry(to, template.subject, template.html, {
    templateId: 'form-confirmation',
  });
}

export async function sendLeadNotification(lead: {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  projectType?: string;
  serviceType?: string;
  budgetRange?: string;
  timeline?: string;
  message?: string;
  source?: string;
}) {
  const template = emailTemplates.adminLeadNotification(lead);
  return emailService.sendEmailWithRetry(adminEmail(), template.subject, template.html, {
    templateId: 'admin-lead-notification',
    replyTo: lead.email,
  });
}

export async function sendNewsletterConfirmation(to: string, token: string) {
  const base = frontendBase();
  const confirmLink = `${base}/api/v1/newsletter/confirm?token=${encodeURIComponent(token)}`;
  const template = emailTemplates.newsletterConfirmation(confirmLink);
  return emailService.sendEmailWithRetry(to, template.subject, template.html, {
    templateId: 'newsletter-confirmation',
  });
}

export async function sendNewsletterWelcome(to: string, unsubToken?: string) {
  const base = frontendBase();
  const unsubscribeLink = unsubToken
    ? `${base}/api/v1/newsletter/unsubscribe?token=${encodeURIComponent(unsubToken)}`
    : undefined;
  const template = emailTemplates.newsletterWelcome(unsubscribeLink);
  return emailService.sendEmailWithRetry(to, template.subject, template.html, {
    templateId: 'newsletter-welcome',
  });
}

export async function sendCareerNotification(application: {
  name: string;
  email: string;
  phone?: string;
  position: string;
  message: string;
  resumeUrl?: string;
}) {
  const template = emailTemplates.careerApplicationNotification(application);
  return emailService.sendEmailWithRetry(adminEmail(), template.subject, template.html, {
    templateId: 'career-application-notification',
    replyTo: application.email,
  });
}

export async function sendCareerConfirmation(to: string, name: string, position: string) {
  const template = emailTemplates.careerApplicationConfirmation(name, position);
  return emailService.sendEmailWithRetry(to, template.subject, template.html, {
    templateId: 'career-application-confirmation',
  });
}

export async function sendQuizFollowUp(to: string, name: string, service: string) {
  const template = emailTemplates.quizRecommendations(name, service);
  return emailService.sendEmailWithRetry(to, template.subject, template.html, {
    templateId: 'quiz-recommendations',
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const base = frontendBase();
  const resetUrl = `${base}/admin/reset-password?token=${encodeURIComponent(token)}`;
  const template = emailTemplates.passwordReset(name, resetUrl);
  return emailService.sendEmailWithRetry(to, template.subject, template.html, {
    templateId: 'password-reset',
  });
}
