jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    coreValue: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teamMember: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    testimonial: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../services/CacheService', () => ({
  cacheService: { clear: jest.fn() },
}));

const prisma = require('../../config/database').default;
const { cacheService } = require('../../services/CacheService');
const {
  createCoreValue,
  listBrandTeam,
  createBrandTeamMember,
  updateBrandTeamMember,
  listBrandTestimonials,
} = require('../../services/AdminBrandingService');

describe('AdminBrandingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a core value defaulting order to 0', async () => {
    prisma.coreValue.create.mockResolvedValueOnce({ id: 'cv_1', order: 0 });

    const result = await createCoreValue({ name: 'Integrity', description: 'We do the right thing', iconName: 'shield' });

    expect(result.order).toBe(0);
    expect(cacheService.clear).toHaveBeenCalledTimes(1);
  });

  it('maps team members to the branding-page shape, deriving social links from JSON', async () => {
    prisma.teamMember.findMany.mockResolvedValueOnce([
      {
        id: 't_1',
        name: 'Jane',
        role: 'Engineer',
        bio: null,
        photo: { url: '/uploads/jane.png' },
        socialLinks: { linkedin: 'https://linkedin.com/in/jane', twitter: '' },
        displayOrder: 0,
        isActive: true,
      },
    ]);

    const result = await listBrandTeam();

    expect(result[0]).toEqual({
      id: 't_1',
      name: 'Jane',
      role: 'Engineer',
      bio: '',
      photoUrl: '/uploads/jane.png',
      linkedinUrl: 'https://linkedin.com/in/jane',
      twitterUrl: '',
      order: 0,
      published: true,
    });
  });

  it('creates a branding-page team member, packing social URLs into JSON', async () => {
    prisma.teamMember.create.mockResolvedValueOnce({ id: 't_1' });

    await createBrandTeamMember({ name: 'Jane', role: 'Engineer', linkedinUrl: 'https://linkedin.com/in/jane' });

    expect(prisma.teamMember.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        socialLinks: { linkedin: 'https://linkedin.com/in/jane', twitter: '', photoUrl: '' },
      }),
    });
    expect(cacheService.clear).toHaveBeenCalledTimes(1);
  });

  it('merges partial social-link updates onto the existing JSON blob', async () => {
    prisma.teamMember.findUnique.mockResolvedValueOnce({
      id: 't_1',
      socialLinks: { linkedin: 'old', twitter: 'old-twitter' },
    });
    prisma.teamMember.update.mockResolvedValueOnce({ id: 't_1' });

    await updateBrandTeamMember('t_1', { linkedinUrl: 'new-linkedin' });

    expect(prisma.teamMember.update).toHaveBeenCalledWith({
      where: { id: 't_1' },
      data: expect.objectContaining({
        socialLinks: { linkedin: 'new-linkedin', twitter: 'old-twitter' },
      }),
    });
  });

  it('maps testimonials to the branding-page shape with a positional order', async () => {
    prisma.testimonial.findMany.mockResolvedValueOnce([
      { id: 'tm_1', quote: 'Great!', clientName: 'Bob', title: 'CEO', company: 'Acme', photo: null, isApproved: true },
    ]);

    const result = await listBrandTestimonials();

    expect(result[0]).toMatchObject({ author: 'Bob', title: 'CEO', order: 0, published: true, logoUrl: '' });
  });
});

export {};
