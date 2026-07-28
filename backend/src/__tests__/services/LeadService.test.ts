jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    formSubmission: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    conversionFunnel: {
      create: jest.fn(),
    },
    analyticsEvent: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../services/EmailService', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
  sendLeadNotification: jest.fn().mockResolvedValue({ success: true }),
}));

const prisma = require('../../config/database').default;
const {
  categorizeLead,
  checkDuplicateEmail,
  createLead,
} = require('../../services/LeadService');
const mockedEmailService = require('../../services/EmailService') as {
  sendWelcomeEmail: jest.Mock;
  sendLeadNotification: jest.Mock;
};

const mockedPrisma = prisma as unknown as {
  formSubmission: { findFirst: jest.Mock; create: jest.Mock };
  conversionFunnel: { create: jest.Mock };
  analyticsEvent: { create: jest.Mock };
};

describe('LeadService', () => {
  beforeEach(() => {
    mockedEmailService.sendWelcomeEmail.mockResolvedValue({ success: true });
    mockedEmailService.sendLeadNotification.mockResolvedValue({ success: true });
  });

  it('categorizes leads', () => {
    expect(categorizeLead('Enterprise Software', undefined)).toBe('enterprise');
    expect(categorizeLead('Web Development', undefined)).toBe('product');
    expect(categorizeLead('DevOps Advisory', undefined)).toBe('infrastructure');
    expect(categorizeLead(undefined, undefined)).toBe('general');
  });

  it('checks duplicate email in last 30 days', async () => {
    mockedPrisma.formSubmission.findFirst.mockResolvedValueOnce({ id: 'lead_1' });
    await expect(checkDuplicateEmail('dup@dntech.id')).resolves.toBe(true);

    mockedPrisma.formSubmission.findFirst.mockResolvedValueOnce(null);
    await expect(checkDuplicateEmail('new@dntech.id')).resolves.toBe(false);
  });

  it('creates lead + tracking records', async () => {
    mockedPrisma.formSubmission.findFirst.mockResolvedValueOnce(null);
    mockedPrisma.formSubmission.create.mockResolvedValueOnce({
      id: 'lead_abc',
      email: 'john@example.com',
    });
    mockedPrisma.conversionFunnel.create.mockResolvedValueOnce({ id: 'f_1' });
    mockedPrisma.analyticsEvent.create.mockResolvedValueOnce({ id: 'a_1' });

    const result = await createLead(
      {
        name: 'John',
        email: 'john@example.com',
        serviceType: 'Web Development',
        message: 'Need a new website',
      },
      { ip: '127.0.0.1', userAgent: 'jest' }
    );

    expect(result.submission.id).toBe('lead_abc');
    expect(result.isDuplicate).toBe(false);
    expect(result.leadCategory).toBe('product');
    expect(mockedPrisma.formSubmission.create).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.conversionFunnel.create).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.analyticsEvent.create).toHaveBeenCalledTimes(1);
  });
});
