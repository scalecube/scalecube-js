import { Observable } from 'rxjs/Observable';
import { Observable as rxjs6Observable } from 'rxjs6/Observable';
import { createStore } from 'redux';
import { isObservable } from 'src/scalecube-services/services/utils';
import { Observable as esObservable } from './esObservable';

describe('Check if isObservable method detects different kinds of Observables as Observable', () => {
  it('isObservable should return true for RxJS v.5 observables', () => {
    const obsFrom = Observable.from([1, 2, 3]);

    const obsConditional = Observable.if(
      () => Boolean(Math.floor(Math.random() * 2)),
      Observable.of(1, 2, 3),
      Observable.from([4, 5, 6]),
    );

    expect(isObservable(obsFrom)).toBeTruthy();
    expect(isObservable(obsConditional)).toBeTruthy();
  });

  it('isObservable should return true for RxJS v.6 observables', () => {
    const obsFrom = rxjs6Observable.from([1, 2, 3]);

    const obsConditional = rxjs6Observable.if(
      () => true,
      rxjs6Observable.of(1, 2, 3),
      rxjs6Observable.from([4, 5, 6]),
    );
    expect(isObservable(obsFrom)).toBeTruthy();
    expect(isObservable(obsConditional)).toBeTruthy();
  });

  it('isObservable should return true for proposal-observable observables', () => {
    const obsFrom = esObservable.from([1, 2, 3]);

    expect(isObservable(obsFrom)).toBeTruthy();
  });

  it('Is observable should return false for Redux store', () => {
    // this test is important because Redux build on top of observable and have subscribe method
    // but the store is not observable, it important to cover this case and also be compatible with this lib

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
