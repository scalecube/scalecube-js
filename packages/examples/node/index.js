const path = require('path');

const { fork } = require('child_process');

const mockServers = [
  'node/helloService.js',
  'node/personService.js',
  'node/greetMePlzService.js',
  'node/seedService.js',
];

// load services
mockServers.forEach((filePath) => {
  const ms = fork(path.resolve('.', filePath));
  ms.send('');
});
