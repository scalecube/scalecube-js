import EventEmitter = require('events');
// @ts-ignore
const myEmitter = new EventEmitter();

// @ts-ignore
global.addEventListener = myEmitter.addListener.bind(myEmitter);
// @ts-ignore
global.removeEventListener = myEmitter.removeListener.bind(myEmitter);
