module.exports = {
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  testRegex: '(\\.|/)spec\\.ts$',
  testPathIgnorePatterns: ['<rootDir>/es/', '<rootDir>/lib/', '<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleDirectories: ['node_modules', 'src'],
  globals: {
    isNodeEvn: false,
  },
  setupFilesAfterEnv: ['<rootDir>/tests/messageChannelMock.ts', '<rootDir>/tests/createObjectUrl.ts'],
};
