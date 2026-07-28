import {
  CONTENT_PILLARS,
  getPillarForCategory,
  getRelatedServiceLinks,
} from '@/lib/content-pillars';

describe('content pillars', () => {
  it('contains expected pillar structures', () => {
    expect(CONTENT_PILLARS.length).toBeGreaterThanOrEqual(4);
    for (const pillar of CONTENT_PILLARS) {
      expect(pillar.id).toBeTruthy();
      expect(pillar.href.startsWith('/')).toBe(true);
    }
  });

  it('finds a pillar by category', () => {
    const result = getPillarForCategory('Startup');
    expect(result?.id).toBe('startup');
    expect(getPillarForCategory(undefined)).toBeNull();
  });

  it('returns related service links by category', () => {
    const links = getRelatedServiceLinks('Tech Stack', [
      { slug: 'cto-as-a-service', name: 'CTO as a Service', category: 'tech stack' },
      { slug: 'web-dev', name: 'Web Dev', category: 'product' },
    ]);
    expect(links).toHaveLength(1);
    expect(links[0].href).toBe('/services/cto-as-a-service');
  });
});
