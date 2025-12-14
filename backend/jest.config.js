module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
  testTimeout: 20000,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.schema.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
  ],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};
