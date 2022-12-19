module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended/all'],
  preset: 'ts-jest',
  testMatch: null,
  testRegex: '.*\\.test\\.(js|ts)$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['js', 'ts'],
  clearMocks: true,
  testTimeout: 20000,
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  setupFiles: ['<rootDir>/setupTests.js'],
}
