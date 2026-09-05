import { z } from 'zod';
import prisma from '../config/database';
import { param, AppError } from '../utils/helpers';
import { hashPassword, validatePassword } from '../utils/auth';

/**
 * Admin user-management logic, extracted from backend/src/routes/admin.ts.
 * Behavior preserved 1:1.
 */

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().optional(),
  role: z.enum(['SuperAdmin', 'ContentManager', 'Editor', 'Viewer']),
  assignedSections: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const userSelect = { id: true, name: true, email: true, role: true, isActive: true, lastLogin: true, createdAt: true } as const;
const userSelectMinimal = { id: true, name: true, email: true, role: true, isActive: true } as const;

export async function listUsers(query: Record<string, unknown>) {
  const { role, search } = query;
  const where: Record<string, unknown> = { deletedAt: null };
  if (role) where.role = String(role);
  if (search) where.email = { contains: String(search) };

  return prisma.user.findMany({
    where,
    select: userSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createUser(body: unknown, creatorId: string) {
  const data = userSchema.parse(body);
  const password = data.password || 'Temp@123456';
  if (!validatePassword(password)) {
    throw new AppError(400, 'WEAK_PASSWORD', 'Password does not meet requirements');
  }
  const passwordHash = await hashPassword(password);
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      assignedSections: data.assignedSections,
      createdById: creatorId,
    },
    select: userSelectMinimal,
  });
}

export async function updateUser(id: string, body: unknown) {
  const data = userSchema.partial().parse(body);
  const updateData: Record<string, unknown> = { ...data };
  if (data.password) {
    if (!validatePassword(data.password)) throw new AppError(400, 'WEAK_PASSWORD', 'Password does not meet requirements');
    updateData.passwordHash = await hashPassword(data.password);
    delete updateData.password;
  }
  return prisma.user.update({
    where: { id: param(id) },
    data: updateData,
    select: userSelectMinimal,
  });
}

export async function deleteUser(id: string) {
  await prisma.user.update({ where: { id: param(id) }, data: { deletedAt: new Date(), isActive: false } });
}
