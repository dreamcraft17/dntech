jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    teamMember: { findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
    faq: { findMany: jest.fn(), create: jest.fn() },
    career: { findMany: jest.fn(), create: jest.fn() },
  },
}));

jest.mock('../../services/CacheService', () => ({
  cacheService: { clear: jest.fn() },
}));

const prisma = require('../../config/database').default;
const { cacheService } = require('../../services/CacheService');
const {
  createTeamMember,
  deleteTeamMember,
  createFaq,
  createCareer,
} = require('../../services/AdminDirectoryService');

describe('AdminDirectoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a team member and clears cache', async () => {
    prisma.teamMember.create.mockResolvedValueOnce({ id: 't_1' });

    await createTeamMember({ name: 'Jane', role: 'Engineer' });

    expect(prisma.teamMember.create).toHaveBeenCalled();
    expect(cacheService.clear).toHaveBeenCalledTimes(1);
  });

  it('treats empty-string email as absent (preprocess coercion)', async () => {
    prisma.teamMember.create.mockResolvedValueOnce({ id: 't_1' });

    await createTeamMember({ name: 'Jane', role: 'Engineer', email: '' });

    const callArgs = prisma.teamMember.create.mock.calls[0][0];
    expect(callArgs.data.email).toBeUndefined();
  });

  it('deletes a team member', async () => {
    await deleteTeamMember('t_1');
    expect(prisma.teamMember.delete).toHaveBeenCalledWith({ where: { id: 't_1' } });
    expect(cacheService.clear).toHaveBeenCalledTimes(1);
  });

  it('creates a FAQ without touching the cache (preserves existing behavior)', async () => {
    prisma.faq.create.mockResolvedValueOnce({ id: 'f_1' });

    await createFaq({ question: 'Q?', answer: 'A.' });

    expect(prisma.faq.create).toHaveBeenCalled();
    expect(cacheService.clear).not.toHaveBeenCalled();
  });

  it('creates a career, slugifying the title', async () => {
    prisma.career.create.mockResolvedValueOnce({ id: 'c_1' });

    await createCareer({ title: 'Senior Engineer', description: 'A great role for someone' });

    expect(prisma.career.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: 'senior-engineer' }),
    });
  });
});

export {};
