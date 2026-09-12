import {
  DEFAULT_FOUNDER,
  hasAboutCopy,
  parseAboutContent,
  resolveAboutContent,
  resolveFounder,
} from '@/lib/about-content';

describe('parseAboutContent', () => {
  it('returns empty object for missing or invalid input', () => {
    expect(parseAboutContent(undefined)).toEqual({});
    expect(parseAboutContent('not-json')).toEqual({});
    expect(parseAboutContent([])).toEqual({});
    expect(parseAboutContent({ values: 'oops' })).toEqual({});
  });

  it('parses JSON strings and objects', () => {
    expect(parseAboutContent('{"mission":"Build"}')).toEqual({ mission: 'Build' });
    expect(parseAboutContent({ story: 'Hello' })).toEqual({ story: 'Hello' });
    expect(
      parseAboutContent({
        founder: { name: 'Dozer Napitupulu', role: 'Founder', bio: 'Studio lead.' },
      }),
    ).toEqual({
      founder: { name: 'Dozer Napitupulu', role: 'Founder', bio: 'Studio lead.' },
    });
  });

  it('keeps only well-shaped values and achievements', () => {
    expect(
      parseAboutContent({
        story: '  ',
        values: [{ title: 'Jujur', description: 'No fake clients' }, { title: 'Nope' }, 'x'],
        achievements: ['One', 2, ''],
      }),
    ).toEqual({
      values: [{ title: 'Jujur', description: 'No fake clients' }],
      achievements: ['One'],
    });
  });
});

describe('resolveAboutContent', () => {
  it('falls back to brand story and mission when settings are empty', () => {
    const resolved = resolveAboutContent(
      {},
      { story: 'Studio story', mission: 'Honest mission' },
      [{ name: 'Jujur', description: 'No fake clients' }],
    );
    expect(resolved.story).toBe('Studio story');
    expect(resolved.mission).toBe('Honest mission');
    expect(resolved.founder).toEqual(DEFAULT_FOUNDER);
    expect(resolved.values).toEqual([{ title: 'Jujur', description: 'No fake clients' }]);
  });

  it('prefers SiteSettings aboutContent over brand seed', () => {
    const resolved = resolveAboutContent(
      { story: 'CMS story', mission: 'CMS mission', values: [{ title: 'A', description: 'B' }] },
      { story: 'Brand story', mission: 'Brand mission' },
      [{ name: 'Ignored', description: 'x' }],
    );
    expect(resolved.story).toBe('CMS story');
    expect(resolved.mission).toBe('CMS mission');
    expect(resolved.values).toEqual([{ title: 'A', description: 'B' }]);
  });
});

describe('resolveFounder', () => {
  it('falls back to Dozer Napitupulu when CMS founder is missing', () => {
    expect(resolveFounder()).toEqual(DEFAULT_FOUNDER);
  });

  it('keeps a provided name and fills missing role or bio from the default', () => {
    expect(resolveFounder({ name: 'Dozer Napitupulu' })).toEqual({
      name: 'Dozer Napitupulu',
      role: DEFAULT_FOUNDER.role,
      bio: DEFAULT_FOUNDER.bio,
    });
  });
});

describe('hasAboutCopy', () => {
  it('is false when every field is empty', () => {
    expect(hasAboutCopy({})).toBe(false);
  });

  it('is true when story is present', () => {
    expect(hasAboutCopy({ story: 'Studio' })).toBe(true);
  });
});
