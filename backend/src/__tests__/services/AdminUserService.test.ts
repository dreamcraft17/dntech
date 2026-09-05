jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../utils/auth', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  validatePassword: jest.fn(),
}));

const prisma = require('../../config/database').default;
const { hashPassword, validatePassword } = require('../../utils/auth');
const { listUsers, createUser, updateUser, deleteUser } = require('../../services/AdminUserService');

describe('AdminUserService', () => {
  beforeEach(() => {
    // jest.config.js sets resetMocks:true, which wipes mockResolvedValue/mockReturnValue
    // set at jest.mock() factory time before every test — so (re)establish defaults here.
    hashPassword.mockResolvedValue('hashed-password');
  });

  it('lists non-deleted users', async () => {
    prisma.user.findMany.mockResolvedValueOnce([{ id: 'u_1' }]);

    const result = await listUsers({});

    expect(result).toHaveLength(1);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null } })
    );
  });

  it('creates a user with a default temp password when none supplied', async () => {
    validatePassword.mockReturnValue(true);
    prisma.user.create.mockResolvedValueOnce({ id: 'u_1', email: 'new@dntech.id' });

    const result = await createUser(
      { name: 'New User', email: 'new@dntech.id', role: 'Viewer' },
      'creator_1'
    );

    expect(result.id).toBe('u_1');
    expect(validatePassword).toHaveBeenCalledWith('Temp@123456');
    expect(hashPassword).toHaveBeenCalledWith('Temp@123456');
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ passwordHash: 'hashed-password', createdById: 'creator_1' }),
      })
    );
  });

  it('rejects a weak password on create', async () => {
    validatePassword.mockReturnValue(false);

    await expect(
      createUser({ name: 'X', email: 'x@dntech.id', role: 'Viewer', password: 'weak' }, 'creator_1')
    ).rejects.toMatchObject({ statusCode: 400, code: 'WEAK_PASSWORD' });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects a weak password on update and does not touch the DB', async () => {
    validatePassword.mockReturnValue(false);

    await expect(updateUser('u_1', { password: 'weak' })).rejects.toMatchObject({
      statusCode: 400,
      code: 'WEAK_PASSWORD',
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('hashes a new password on update and strips the plaintext field', async () => {
    validatePassword.mockReturnValue(true);
    prisma.user.update.mockResolvedValueOnce({ id: 'u_1' });

    await updateUser('u_1', { password: 'StrongPass123!' });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u_1' },
      data: expect.objectContaining({ passwordHash: 'hashed-password' }),
      select: expect.any(Object),
    });
    const callArgs = prisma.user.update.mock.calls[0][0];
    expect(callArgs.data.password).toBeUndefined();
  });

  it('soft-deletes a user (sets deletedAt + isActive false)', async () => {
    prisma.user.update.mockResolvedValueOnce({ id: 'u_1' });

    await deleteUser('u_1');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u_1' },
      data: { deletedAt: expect.any(Date), isActive: false },
    });
  });
});

export {};
