import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { param, AppError, getPagination } from '../utils/helpers';

/**
 * Media upload configuration (multer) and media library CRUD, extracted
 * from backend/src/routes/admin.ts. Behavior preserved 1:1.
 */

export const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
});

export async function listMedia(query: Record<string, unknown>) {
  const { search } = query;
  const { page, pageSize, skip } = getPagination(query);
  const where: Record<string, unknown> = {};
  if (search) where.originalFilename = { contains: String(search) };

  const [media, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
    prisma.media.count({ where }),
  ]);

  return { media, page, pageSize, total };
}

export async function createMediaFromUpload(
  file: Express.Multer.File | undefined,
  userId: string
) {
  if (!file) throw new AppError(400, 'NO_FILE', 'No file uploaded');

  const url = `/uploads/${file.filename}`;
  return prisma.media.create({
    data: {
      filename: file.filename,
      originalFilename: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      url,
      uploadedById: userId,
    },
  });
}

const mediaUpdateSchema = z.object({
  altText: z.string().optional(),
  description: z.string().optional(),
});

export async function updateMedia(id: string, body: unknown) {
  const { altText, description } = mediaUpdateSchema.parse(body);
  return prisma.media.update({
    where: { id: param(id) },
    data: { altText, description },
  });
}

export async function deleteMedia(id: string) {
  const media = await prisma.media.findUnique({ where: { id: param(id) } });
  if (media) {
    const filePath = path.join(uploadDir, media.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await prisma.media.delete({ where: { id: param(id) } });
  }
}
