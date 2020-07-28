const { exec } = require('child_process');

module.exports = {
  start: exec('yarn start', { cwd: '../../' }),
};
