module.exports = {
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  testRegex: '(\\.|/)spec\\.ts$',
  testPathIgnorePatterns: ['<rootDir>/es/', '<rootDir>/lib/', '<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'node'],
  moduleDirectories: ['node_modules', 'app/src'],
};
