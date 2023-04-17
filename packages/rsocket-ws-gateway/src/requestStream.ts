import { Flowable } from 'rsocket-flowable';
import { RequestHandler } from './api/Gateway';
import { Observable } from 'rxjs';

const flowableHandler: RequestHandler = (serviceCall, data, subscriber) => {
  let sub;
  subscriber.onSubscribe({
    cancel: () => {
      console.log('cancel', sub);
      sub && sub.unsubscribe();
    },
    request: () => {
      sub = serviceCall.requestStream(data).subscribe(
        (response: any) => {
          subscriber.onNext({ data: response });
        },
        (error: any) => subscriber.onError(error),
        () => subscriber.onComplete()
      );
    },
  });
};

export const requestStream = ({ data }, serviceCall, handler = flowableHandler) => {
  const flowable = new Flowable(handler.bind(null, serviceCall, data));

  const obs = new Observable((ob) => {
    let cancel;
    flowable.subscribe({
      onNext: ob.next,
      onError: ob.error,
      onComplete: ob.complete,
      onSubscribe: (sub) => {
        console.log('sub');
        cancel = sub.cancel;
      },
    });
    return {
      unsubscribe: () => {
        console.log('obs unsub', cancel);
        cancel();
      },
    };
  });
  return obs;
};
