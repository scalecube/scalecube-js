importScripts('https://cdnjs.cloudflare.com/ajax/libs/rxjs/6.4.0/rxjs.umd.min.js');

reactiveStreamExample = {
  getInterval: (time) => rxjs.timer(0, time || 1000),
};
