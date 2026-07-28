const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/lib/api.ts',
    'src/lib/utils.ts',
    'src/lib/currency.ts',
    'src/lib/read-time.ts',
    'src/lib/content-pillars.ts',
    'src/hooks/useExitIntent.ts',
    'src/components/ui/Button.tsx',
    'src/components/ui/Modal.tsx',
    'src/components/ui/Alert.tsx',
    'src/components/ui/Badge.tsx',
    'src/components/ui/Card.tsx',
    'src/components/forms/ContactForm.tsx',
  ],
};

module.exports = createJestConfig(config);
