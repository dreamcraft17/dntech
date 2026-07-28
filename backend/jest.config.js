/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  collectCoverageFrom: [
    'src/utils/auth.ts',
    'src/utils/helpers.ts',
    'src/services/LeadService.ts',
    'src/services/CacheService.ts',
    'src/templates/emailTemplates.ts',
    'src/routes/leads.ts',
    'src/routes/newsletter.ts',
    'src/routes/products.ts',
    'src/routes/auth.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  clearMocks: true,
  resetMocks: true,
  testTimeout: 15000,
};
