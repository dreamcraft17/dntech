import type { Meta, StoryObj } from '@storybook/react';
import { HomeProducts } from './HomeProducts';
import type { Product } from '@/types';

const meta: Meta<typeof HomeProducts> = {
  title: 'Homepage/HomeProducts',
  component: HomeProducts,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof HomeProducts>;

function product(partial: Partial<Product> & Pick<Product, 'id' | 'name' | 'slug'>): Product {
  return {
    description: `${partial.name} description`,
    ...partial,
  };
}

export const FeaturedRail: Story = {
  args: {
    products: [
      product({
        id: '1',
        name: 'dnPeople',
        slug: 'dnpeople',
        featured: true,
        category: 'HRIS / Payroll',
        tagline: 'HRIS & payroll untuk UKM — gaji, absensi, cuti di satu dashboard.',
        description:
          'Capek manual payroll tiap bulan? dnPeople otomasi payroll, cuti, absensi, dan talent development dalam satu dashboard.',
        customerCount: 'Soft launch',
      }),
      product({
        id: '2',
        name: 'dnCore',
        slug: 'dncore',
        category: 'ERP',
        tagline: 'ERP keuangan, stok, dan proyek dalam satu platform.',
      }),
      product({
        id: '3',
        name: 'dnShop Finance',
        slug: 'dnshop-finance',
        category: 'FinTech',
        tagline: 'Pembukuan Shopee seller — sync order, pajak, SAK EMKM.',
      }),
    ],
  },
};
