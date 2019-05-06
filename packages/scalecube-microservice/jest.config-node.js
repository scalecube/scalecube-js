const jestConfig = require('./jest.config-dom');

jestConfig.testEnvironment = 'node';
jestConfig.testPathIgnorePatterns.push('<rootDir>/tests/implementations/ImportHtmlService.spec.ts');
jestConfig.globals.isNodeEvn = true;
module.exports = jestConfig;
