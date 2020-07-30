const p = require('./e2eStart');
p.start.kill('SIGQUIT');
module.exports = require('jest-environment-puppeteer').teardown;
