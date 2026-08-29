import { DEFAULT_ADVANTAGES } from '@/lib/homepage-content';

describe('homepage-content', () => {
  it('avoids traction inflation in default advantages', () => {
    const techStack = DEFAULT_ADVANTAGES.find((item) => item.title === 'Tech Stack Modern');
    expect(techStack).toBeDefined();
    expect(techStack?.description).not.toMatch(/ratusan|jutaan user/i);
    expect(techStack?.description).toMatch(/first-party|SaaS/i);
  });
});
