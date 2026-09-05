jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    formSubmission: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
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
  listLeadsAdmin,
  getLeadByIdAdmin,
  updateLeadStatus,
  assignLead,
  addLeadNote,
  exportLeadsCsv,
  deleteLeadAdmin,
} = require('../../services/LeadService');
const mockedEmailService = require('../../services/EmailService') as {
  sendWelcomeEmail: jest.Mock;
  sendLeadNotification: jest.Mock;
};

const mockedPrisma = prisma as unknown as {
  formSubmission: {
    findFirst: jest.Mock; findUnique: jest.Mock; create: jest.Mock;
    update: jest.Mock; findMany: jest.Mock; count: jest.Mock; delete: jest.Mock;
  };
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

describe('LeadService admin operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists leads with pagination', async () => {
    mockedPrisma.formSubmission.findMany.mockResolvedValueOnce([{ id: 'lead_1' }]);
    mockedPrisma.formSubmission.count.mockResolvedValueOnce(1);

    const result = await listLeadsAdmin({ page: '1', pageSize: '20' });

    expect(result.leads).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('fetches a lead by id and marks it as read', async () => {
    mockedPrisma.formSubmission.findUnique.mockResolvedValueOnce({ id: 'lead_1', isRead: false });
    mockedPrisma.formSubmission.update.mockResolvedValueOnce({ id: 'lead_1', isRead: true });

    const result = await getLeadByIdAdmin('lead_1');

    expect(result.id).toBe('lead_1');
    expect(mockedPrisma.formSubmission.update).toHaveBeenCalledWith({
      where: { id: 'lead_1' },
      data: { isRead: true },
    });
  });

  it('throws AppError(404) when the lead does not exist', async () => {
    mockedPrisma.formSubmission.findUnique.mockResolvedValueOnce(null);

    await expect(getLeadByIdAdmin('missing')).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  });

  it('validates and updates lead status', async () => {
    mockedPrisma.formSubmission.update.mockResolvedValueOnce({ id: 'lead_1', status: 'contacted' });

    const result = await updateLeadStatus('lead_1', { status: 'contacted' });

    expect(result.status).toBe('contacted');
  });

  it('rejects an invalid lead status', async () => {
    await expect(updateLeadStatus('lead_1', { status: 'bogus' })).rejects.toThrow();
    expect(mockedPrisma.formSubmission.update).not.toHaveBeenCalled();
  });

  it('assigns a lead to a user', async () => {
    mockedPrisma.formSubmission.update.mockResolvedValueOnce({ id: 'lead_1', assignedToId: 'user_2' });

    const result = await assignLead('lead_1', { assignedToId: 'user_2' });

    expect(result.assignedToId).toBe('user_2');
  });

  it('appends a timestamped note to existing notes', async () => {
    mockedPrisma.formSubmission.findUnique.mockResolvedValueOnce({ id: 'lead_1', notes: 'Old note' });
    mockedPrisma.formSubmission.update.mockResolvedValueOnce({ id: 'lead_1', notes: 'combined' });

    await addLeadNote('lead_1', { note: 'New note' });

    const callArgs = mockedPrisma.formSubmission.update.mock.calls[0][0];
    expect(callArgs.data.notes).toContain('Old note');
    expect(callArgs.data.notes).toContain('New note');
  });

  it('sets the note as-is when there are no existing notes', async () => {
    mockedPrisma.formSubmission.findUnique.mockResolvedValueOnce({ id: 'lead_1', notes: null });
    mockedPrisma.formSubmission.update.mockResolvedValueOnce({ id: 'lead_1' });

    await addLeadNote('lead_1', { note: 'First note' });

    const callArgs = mockedPrisma.formSubmission.update.mock.calls[0][0];
    expect(callArgs.data.notes).toBe('First note');
  });

  it('exports leads as CSV with a header row', async () => {
    mockedPrisma.formSubmission.findMany.mockResolvedValueOnce([
      {
        id: 'lead_1', formType: 'contact', name: 'John', email: 'john@example.com',
        phone: null, subject: null, status: 'new', createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    const csv = await exportLeadsCsv(undefined);

    expect(csv.split('\n')[0]).toBe('id,form_type,name,email,phone,subject,status,created_at');
    expect(csv).toContain('"John"');
  });

  it('deletes a lead', async () => {
    await deleteLeadAdmin('lead_1');
    expect(mockedPrisma.formSubmission.delete).toHaveBeenCalledWith({ where: { id: 'lead_1' } });
  });
});
