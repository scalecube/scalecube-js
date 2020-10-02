import { Flowable } from 'rsocket-flowable';
import { RequestHandler } from './api/Gateway';

const flowableHandler: RequestHandler = (serviceCall, data, subscriber) => {
  let sub;
  subscriber.onSubscribe({
    cancel: () => {
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
  return new Flowable(handler.bind(null, serviceCall, data));
};
