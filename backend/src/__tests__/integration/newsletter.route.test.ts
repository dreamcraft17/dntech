import express from 'express';
import request from 'supertest';
import { errorHandler } from '../../utils/helpers';
import * as emailService from '../../services/EmailService';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    newsletterSubscriber: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../services/EmailService', () => ({
  sendNewsletterConfirmation: jest.fn().mockResolvedValue({ success: true }),
  sendNewsletterWelcome: jest.fn().mockResolvedValue({ success: true }),
}));

const newsletterRouter = require('../../routes/newsletter').default;
const mockedPrisma = require('../../config/database').default as {
  newsletterSubscriber: {
    findUnique: jest.Mock;
    upsert: jest.Mock;
    update: jest.Mock;
  };
};

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/newsletter', newsletterRouter);
  app.use(errorHandler);
  return app;
}

describe('newsletter route integration', () => {
  beforeEach(() => {
    (emailService.sendNewsletterConfirmation as jest.Mock).mockResolvedValue({ success: true });
    (emailService.sendNewsletterWelcome as jest.Mock).mockResolvedValue({ success: true });
  });

  it('subscribes new email and sends confirmation', async () => {
    mockedPrisma.newsletterSubscriber.findUnique.mockResolvedValueOnce(null);
    mockedPrisma.newsletterSubscriber.upsert.mockResolvedValueOnce({ id: 'sub_1' });

    const res = await request(buildApp()).post('/api/v1/newsletter/subscribe').send({
      email: 'subscriber@example.com',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(emailService.sendNewsletterConfirmation).toHaveBeenCalled();
  });

  it('returns already subscribed response', async () => {
    mockedPrisma.newsletterSubscriber.findUnique.mockResolvedValueOnce({
      id: 'sub_1',
      status: 'subscribed',
      isActive: true,
    });

    const res = await request(buildApp()).post('/api/v1/newsletter/subscribe').send({
      email: 'subscriber@example.com',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.alreadySubscribed).toBe(true);
  });

  it('rejects invalid confirmation token', async () => {
    mockedPrisma.newsletterSubscriber.findUnique.mockResolvedValueOnce(null);
    const res = await request(buildApp()).get('/api/v1/newsletter/confirm?token=invalidtokeninvalidtoken');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
