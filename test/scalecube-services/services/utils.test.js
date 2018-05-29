import { Observable } from 'rxjs/Observable';
import { Observable as latestObservable } from 'rxjs-latest/Observable';
import { createStore } from 'redux';
import { isObservable } from 'src/scalecube-services/services/utils';
import { Observable as esObservable } from './esObservable';

describe('Check if isObservable method detects different kinds of Observables as Observable', () => {
    it('Current version of RxJS should be supported', () => {
        const obsFrom = Observable.from([1, 2, 3]);

        const obsConditional = Observable.if(
            () => Boolean(Math.floor(Math.random()*2)),
            Observable.of(1, 2, 3),
            Observable.from([4, 5, 6]),
        );

        const esObs = esObservable.from([4, 5, 6]);

        expect(isObservable(obsFrom)).toBeTruthy();
        expect(isObservable(obsConditional)).toBeTruthy();
        expect(isObservable(esObs)).toBeTruthy();
    });

  it('Latest versions of RxJS should be supported', () => {
    const obsFrom = latestObservable.from([1, 2, 3]);

    const obsConditional = latestObservable.if(
      () => true,
      latestObservable.of(1, 2, 3),
      latestObservable.from([4, 5, 6]),
    );

    expect(isObservable(obsFrom)).toBeTruthy();
    expect(isObservable(obsConditional)).toBeTruthy();
  });
  it('Redux should be supported', () => {
    const initialState = {
      value: 0,
    };

    const reducer = (state = initialState.value, action) => {
      switch (action.type) {
        case 1:
          return 1;
        case 2:
          return 2;
        default:
          return state;
      }
    };

    const store = createStore(reducer);
    expect(isObservable(store)).toBeFalsy();
  });
});
