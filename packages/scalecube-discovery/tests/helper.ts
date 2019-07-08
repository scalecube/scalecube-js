import EventEmitter = require('events');
const myEmitter = new EventEmitter();

// @ts-ignore
global.addEventListener = myEmitter.addListener.bind(myEmitter);
// @ts-ignore
global.removeEventListener = myEmitter.removeListener.bind(myEmitter);

global.console.log = (...s: any[]) => {
  process.stdout.write(s.join(' , ') + '\n');
};
