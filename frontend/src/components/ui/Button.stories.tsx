import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Konsultasi Gratis', variant: 'primary' },
};

export const Secondary: Story = {
  args: { children: 'Lihat Produk', variant: 'secondary' },
};

export const Outline: Story = {
  args: { children: 'Pelajari Lebih Lanjut', variant: 'outline' },
};

export const Loading: Story = {
  args: { children: 'Mengirim...', loading: true, disabled: true },
};
