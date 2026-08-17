import { PrismaClient, Prisma } from '@prisma/client';

export const prisma = new PrismaClient();

export interface ProductSeedInput {
  name: string;
  slug: string;
  category: string;
  displayOrder: number;
  description: string;
  data: Omit<Prisma.ProductCreateInput, 'name' | 'slug' | 'category' | 'description' | 'displayOrder'>;
}

export async function upsertProduct(input: ProductSeedInput) {
  const { name, slug, category, displayOrder, description, data } = input;

  return prisma.product.upsert({
    where: { slug },
    create: { name, slug, category, displayOrder, description, ...data },
    update: { name, category, displayOrder, description, ...data },
  });
}
