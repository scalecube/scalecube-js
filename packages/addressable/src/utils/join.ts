import { Subject } from './Subject';

export function join(s1: Pick<Subject, 'subscribe'>, s2: Pick<Subject, 'subscribe'>) {
  return {
    subscribe: (fn: (arg: any) => void) => {
      const s = new Subject();
      const uns1 = s1.subscribe((i) => s.next(i));
      const uns2 = s2.subscribe((i) => s.next(i));
      const uns = s.subscribe(fn);

      return () => {
        uns1();
        uns2();
        uns();
      };
    },
  };
}
