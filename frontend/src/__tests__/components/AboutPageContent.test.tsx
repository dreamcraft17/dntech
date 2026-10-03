import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { AboutPageContent, type AboutContent } from '@/components/content/AboutPageContent';
import common from '@/messages/id/common.json';
import pages from '@/messages/id/pages.json';
import type { TeamMember } from '@/types';

const messages = { ...common, ...pages };

function renderIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

function member(partial: Partial<TeamMember> & Pick<TeamMember, 'id' | 'name' | 'role'>): TeamMember {
  return partial;
}

const team: TeamMember[] = [member({ id: '1', name: 'Dozer', role: 'Founder' })];

const fullAbout: AboutContent = {
  story: 'DN Tech dimulai dari kebutuhan software yang jelas dan transparan.',
  mission: 'Membangun software yang benar-benar dipakai.',
  vision: 'Jadi software house lokal terpercaya.',
  values: [
    { title: 'Transparansi', description: 'Tidak ada hidden fees.' },
    { title: 'Kualitas', description: 'Testing menyeluruh sebelum launch.' },
  ],
  achievements: ['10+ project selesai', '5 tahun beroperasi'],
};

describe('AboutPageContent', () => {
  it('renders mission, vision, values, and achievements when present', () => {
    renderIntl(<AboutPageContent about={fullAbout} team={team} />);

    expect(screen.getByText(fullAbout.story!)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Misi Kami' })).toBeInTheDocument();
    expect(screen.getByText(fullAbout.mission!)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Visi Kami' })).toBeInTheDocument();
    expect(screen.getByText(fullAbout.vision!)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Nilai-Nilai Kami' })).toBeInTheDocument();
    expect(screen.getByText('Transparansi')).toBeInTheDocument();
    expect(screen.getByText('Kualitas')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Pencapaian' })).toBeInTheDocument();
    expect(screen.getByText('10+ project selesai')).toBeInTheDocument();
    expect(screen.getByText('5 tahun beroperasi')).toBeInTheDocument();

    // No "not loaded" fallback copy when real content is present.
    expect(screen.queryByText(/belum tersedia/)).not.toBeInTheDocument();
  });

  it('shows the "belum ter-load" fallback when about content is empty', () => {
    const emptyAbout: AboutContent = {};
    renderIntl(<AboutPageContent about={emptyAbout} team={team} />);

    expect(screen.getByText(/Profil studio belum tersedia/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'halaman Produk' })).toHaveAttribute(
      'href',
      '/id/products',
    );

    expect(screen.queryByRole('heading', { name: 'Misi Kami' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Nilai-Nilai Kami' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Pencapaian' })).not.toBeInTheDocument();
  });

  it('renders the team section via TeamSpotlight', () => {
    renderIntl(<AboutPageContent about={fullAbout} team={team} />);

    expect(screen.getByRole('heading', { name: 'Kenali Tim Kami' })).toBeInTheDocument();
    expect(screen.getByText('Dozer')).toBeInTheDocument();
    expect(screen.getByText('Founder')).toBeInTheDocument();
  });

  it('always shows Founded by Dozer Napitupulu when founder is not overridden', () => {
    renderIntl(<AboutPageContent about={fullAbout} team={team} />);

    expect(screen.getByText('Didirikan oleh')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dozer Napitupulu' })).toBeInTheDocument();
    expect(screen.getByText('Founder & Tech Lead')).toBeInTheDocument();
    expect(screen.getByText(/bekerja langsung dengan penulis kodenya/)).toBeInTheDocument();
  });

  it('uses CMS founder copy when provided', () => {
    renderIntl(
      <AboutPageContent
        about={{
          ...fullAbout,
          founder: {
            name: 'Dozer Napitupulu',
            role: 'Founder',
            bio: 'Salinan founder dari CMS.',
          },
        }}
        team={team}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Dozer Napitupulu' })).toBeInTheDocument();
    expect(screen.getByText('Salinan founder dari CMS.')).toBeInTheDocument();
    expect(screen.queryByText(/bekerja langsung dengan penulis kodenya/)).not.toBeInTheDocument();
  });
});
