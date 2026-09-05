jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    siteSettings: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    activityLog: { create: jest.fn() },
  },
}));

jest.mock('../../services/CacheService', () => ({
  cacheService: { clear: jest.fn() },
}));

const prisma = require('../../config/database').default;
const { cacheService } = require('../../services/CacheService');
const { getSettings, updateSettings } = require('../../services/AdminSettingsService');

describe('AdminSettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns existing settings without creating a new row', async () => {
    prisma.siteSettings.findUnique.mockResolvedValueOnce({ id: 1, companyName: 'DN Tech' });

    const result = await getSettings();

    expect(result.companyName).toBe('DN Tech');
    expect(prisma.siteSettings.create).not.toHaveBeenCalled();
  });

  it('bootstraps a default settings row when none exists', async () => {
    prisma.siteSettings.findUnique.mockResolvedValueOnce(null);
    prisma.siteSettings.create.mockResolvedValueOnce({ id: 1 });

    const result = await getSettings();

    expect(result.id).toBe(1);
    expect(prisma.siteSettings.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { id: 1 } })
    );
  });

  it('upserts settings, logs activity, and clears cache', async () => {
    prisma.siteSettings.upsert.mockResolvedValueOnce({ id: 1, companyName: 'Updated Co' });

    const result = await updateSettings({ companyName: 'Updated Co' }, 'user_1', '127.0.0.1');

    expect(result.companyName).toBe('Updated Co');
    expect(prisma.siteSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } })
    );
    expect(prisma.activityLog.create).toHaveBeenCalledTimes(1);
    expect(cacheService.clear).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid settings payload', async () => {
    await expect(updateSettings({ isMaintenanceMode: 'not-a-boolean' }, 'user_1')).rejects.toThrow();
    expect(prisma.siteSettings.upsert).not.toHaveBeenCalled();
  });
});

export {};
