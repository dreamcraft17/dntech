import { emailService, SendEmailOptions } from './EmailService';

interface EmailQueueJob {
  id: string;
  to: string;
  subject: string;
  html: string;
  options?: SendEmailOptions;
  attempts: number;
}

class EmailQueueService {
  private queue: EmailQueueJob[] = [];
  private processing = false;
  private activeJobs = 0;
  private readonly maxConcurrent = 5;

  enqueue(to: string, subject: string, html: string, options?: SendEmailOptions) {
    const id = `email-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.queue.push({ id, to, subject, html, options, attempts: 0 });
    void this.processQueue();
    return id;
  }

  getStatus() {
    return {
      queueLength: this.queue.length,
      activeJobs: this.activeJobs,
      isProcessing: this.processing,
    };
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0 && this.activeJobs < this.maxConcurrent) {
      const job = this.queue.shift();
      if (!job) break;
      this.activeJobs += 1;
      void this.send(job).finally(() => {
        this.activeJobs -= 1;
        this.processing = false;
        void this.processQueue();
      });
    }

    this.processing = false;
  }

  private async send(job: EmailQueueJob) {
    job.attempts += 1;
    const result = await emailService.sendEmail(job.to, job.subject, job.html, job.options);
    if (!result.success && job.attempts < Number(process.env.EMAIL_RETRY_ATTEMPTS || 3)) {
      this.queue.push(job);
    }
  }
}

export const emailQueueService = new EmailQueueService();
