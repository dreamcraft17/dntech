jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    media: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const fs = require('fs');
const prisma = require('../../config/database').default;
const {
  listMedia,
  createMediaFromUpload,
  updateMedia,
  deleteMedia,
} = require('../../services/AdminMediaService');

describe('AdminMediaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
  });

  it('lists media with pagination', async () => {
    prisma.media.findMany.mockResolvedValueOnce([{ id: 'm_1' }]);
    prisma.media.count.mockResolvedValueOnce(1);

    const result = await listMedia({ page: '1', pageSize: '20' });

    expect(result.media).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('creates a media record from an uploaded file', async () => {
    prisma.media.create.mockResolvedValueOnce({ id: 'm_1', url: '/uploads/abc.png' });

    const result = await createMediaFromUpload(
      { filename: 'abc.png', originalname: 'photo.png', size: 1024, mimetype: 'image/png' } as Express.Multer.File,
      'user_1'
    );

    expect(result.id).toBe('m_1');
    expect(prisma.media.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        filename: 'abc.png',
        url: '/uploads/abc.png',
        uploadedById: 'user_1',
      }),
    });
  });

  it('throws AppError(400) when no file is provided', async () => {
    await expect(createMediaFromUpload(undefined, 'user_1')).rejects.toMatchObject({
      statusCode: 400,
      code: 'NO_FILE',
    });
    expect(prisma.media.create).not.toHaveBeenCalled();
  });

  it('updates media alt text / description', async () => {
    prisma.media.update.mockResolvedValueOnce({ id: 'm_1', altText: 'A photo' });

    const result = await updateMedia('m_1', { altText: 'A photo' });

    expect(result.altText).toBe('A photo');
  });

  it('deletes the file from disk and the DB record when found', async () => {
    prisma.media.findUnique.mockResolvedValueOnce({ id: 'm_1', filename: 'abc.png' });

    await deleteMedia('m_1');

    expect(fs.unlinkSync).toHaveBeenCalled();
    expect(prisma.media.delete).toHaveBeenCalledWith({ where: { id: 'm_1' } });
  });

  it('is a no-op when the media record does not exist', async () => {
    prisma.media.findUnique.mockResolvedValueOnce(null);

    await deleteMedia('missing');

    expect(fs.unlinkSync).not.toHaveBeenCalled();
    expect(prisma.media.delete).not.toHaveBeenCalled();
  });
});

export {};
