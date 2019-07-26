module.exports = {
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  testRegex: '(\\.|/)spec\\.ts$',
  testPathIgnorePatterns: ['<rootDir>/es/', '<rootDir>/lib/', '<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleDirectories: ['node_modules', 'app/src'],
  globals: {
    isNodeEvn: false,
  },
  setupFilesAfterEnv: ['<rootDir>/tests/mockEnv.ts', '<rootDir>/tests/messageChannelMock.ts'],
};
