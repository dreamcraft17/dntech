import type { Meta, StoryObj } from '@storybook/react';
import { SectionHeading } from './SectionHeading';

const meta: Meta<typeof SectionHeading> = {
  title: 'Homepage/SectionHeading',
  component: SectionHeading,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof SectionHeading>;

export const TitleOnly: Story = {
  args: { title: 'Layanan Kami' },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Produk software siap pakai',
    subtitle: 'HRIS, ERP, dan pembukuan yang kami bangun dan jalankan sendiri.',
  },
};
