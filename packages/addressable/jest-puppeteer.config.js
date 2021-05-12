module.exports = {
  testRegex: '(\\.|/)browser\\.ts$',
  preset: 'jest-puppeteer',
  globalSetup: './e2eSetup.js',
  globalTeardown: './e2eTeardown.js',
};
