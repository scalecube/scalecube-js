module.exports = {
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  testRegex: '(\\.|/)(test|spec)\\.ts$',
  testPathIgnorePatterns: ['<rootDir>/es/', '<rootDir>/lib/', '<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleDirectories: ['node_modules', 'app/src'],
  setupFilesAfterEnv: ['<rootDir>/tests/messageChannelMock.ts'],
};
