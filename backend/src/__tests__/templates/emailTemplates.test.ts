import { emailTemplates } from '../../templates/emailTemplates';

describe('emailTemplates', () => {
  it('builds form confirmation template', () => {
    const tpl = emailTemplates.formConfirmation('Jane', 'Website');
    expect(tpl.subject).toContain('Terima kasih');
    expect(tpl.html).toContain('Jane');
    expect(tpl.html).toContain('Website');
  });

  it('escapes user-controlled values in admin notification', () => {
    const tpl = emailTemplates.adminLeadNotification({
      name: '<script>alert(1)</script>',
      email: 'x@example.com',
      message: '<b>x</b>',
    });
    expect(tpl.html).not.toContain('<script>');
    expect(tpl.html).toContain('&lt;script&gt;');
  });

  it('includes confirmation link in newsletter email', () => {
    const tpl = emailTemplates.newsletterConfirmation('https://dntech.id/confirm?token=abc');
    expect(tpl.html).toContain('https://dntech.id/confirm?token=abc');
  });

  it('includes unsubscribe link when provided', () => {
    const withLink = emailTemplates.newsletterWelcome('https://dntech.id/unsub');
    const withoutLink = emailTemplates.newsletterWelcome();
    expect(withLink.html).toContain('Unsubscribe');
    expect(withoutLink.html).not.toContain('Unsubscribe');
  });

  it('builds password reset email', () => {
    const tpl = emailTemplates.passwordReset('Admin', 'https://dntech.id/reset');
    expect(tpl.subject).toContain('Reset Password');
    expect(tpl.html).toContain('https://dntech.id/reset');
  });

  it('builds career templates', () => {
    const adminTpl = emailTemplates.careerApplicationNotification({
      name: 'A',
      email: 'a@b.com',
      position: 'Engineer',
      message: 'Hello',
    });
    const userTpl = emailTemplates.careerApplicationConfirmation('A', 'Engineer');
    expect(adminTpl.subject).toContain('Aplikasi Karier');
    expect(userTpl.subject).toContain('Terima kasih');
  });

  it('builds quiz recommendations', () => {
    const tpl = emailTemplates.quizRecommendations('A', 'Web Development');
    expect(tpl.subject).toContain('Rekomendasi');
    expect(tpl.html).toContain('Web Development');
  });
});
