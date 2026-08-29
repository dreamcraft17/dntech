import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: 'Web App Development',
    description: 'Dashboard dan portal untuk operasional bisnis.',
    children: <p className="text-sm text-gray-600">Timeline dan scope disepakati sebelum kick-off.</p>,
  },
};

export const Hover: Story = {
  args: {
    title: 'Custom Software',
    hover: true,
    children: <p className="text-sm text-gray-600">Hover state untuk daftar layanan.</p>,
  },
};

export const WithFooter: Story = {
  args: {
    title: 'Maintenance Package',
    footer: <button type="button" className="text-sm font-medium text-blue-900">Detail paket</button>,
  },
};
