const jestConfig = require('./jest.config-dom');

jestConfig.testEnvironment = 'node';
jestConfig.globals = {
  isNodeEvn: true,
};
jestConfig.setupFilesAfterEnv = ['<rootDir>/tests/helper.ts', ...(jestConfig.setupFilesAfterEnv || [])];

module.exports = jestConfig;
