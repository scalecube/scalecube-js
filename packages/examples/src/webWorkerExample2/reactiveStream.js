importScripts('https://cdnjs.cloudflare.com/ajax/libs/rxjs/6.4.0/rxjs.umd.min.js');

reactiveStreamExample = {
  getInterval: (time) => rxjs.interval(time || 2000),
};
