import { Subject } from './Subject';

export function eachDelta(sbj: Pick<Subject, 'subscribe'>) {
  return {
    subscribe: (fn: (arg: any) => void) => {
      let oldState: any = {};
      const notify = (s: any) => fn(s);
      return sbj.subscribe((state) => {
        for (const key in state) {
          if (!oldState[key] || oldState[key] !== state[key]) {
            notify({ key, value: state[key] });
          }
        }
        for (const key in oldState) {
          if (!state[key]) {
            notify({ key, value: undefined });
          }
        }
        oldState = state;
      });
    },
  };
}
