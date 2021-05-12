const { exec } = require('child_process');

const start = exec('yarn start', { cwd: '../../' });

module.exports = {
  start,
};
