import express from 'express';
import request from 'supertest';
import { errorHandler } from '../../utils/helpers';

jest.mock('../../services/LeadService', () => ({
  createLead: jest.fn(),
  checkDuplicateEmail: jest.fn(),
}));

const leadsRouter = require('../../routes/leads').default;
const mockedLeadService = require('../../services/LeadService') as {
  createLead: jest.Mock;
  checkDuplicateEmail: jest.Mock;
};

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/leads', leadsRouter);
  app.use(errorHandler);
  return app;
}

describe('leads route integration', () => {
  it('creates lead and returns success payload', async () => {
    mockedLeadService.createLead.mockResolvedValueOnce({
      submission: { id: 'lead_1' } as never,
      isDuplicate: false,
      leadCategory: 'product',
    });

    const res = await request(buildApp()).post('/api/v1/leads').send({
      name: 'John',
      email: 'john@example.com',
      message: 'Need website revamp',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.leadId).toBe('lead_1');
  });

  it('validates payload and returns 400', async () => {
    const res = await request(buildApp()).post('/api/v1/leads').send({
      name: '',
      email: 'invalid-email',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('checks duplicate email endpoint', async () => {
    mockedLeadService.checkDuplicateEmail.mockResolvedValueOnce(true);
    const res = await request(buildApp()).post('/api/v1/leads/check-duplicate').send({
      email: 'john@example.com',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.isDuplicate).toBe(true);
  });
});
