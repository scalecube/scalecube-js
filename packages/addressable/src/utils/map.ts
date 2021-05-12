import { Subject } from './Subject';

export function map(mapFn: (arg: any) => any, sbj: Pick<Subject, 'subscribe'>) {
  return {
    subscribe: (fn: (arg: any) => void) => {
      return sbj.subscribe((val) => {
        fn(mapFn(val));
      });
    },
  };
}
