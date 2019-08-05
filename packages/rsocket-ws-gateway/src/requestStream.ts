import { Flowable } from 'rsocket-flowable';
import { packError } from './utils';

export const requestStream = (payload, serviceCall, customCb) => {
  // console.log('request payload: ', payload);
  const { data, metadata } = payload;
  if (customCb) {
    return new Flowable(customCb.bind(null, serviceCall, data));
  }
  return new Flowable((subscriber: any) => {
    subscriber.onSubscribe();
    serviceCall.requestStream(data).subscribe(
      (response: any) => {
        subscriber.onNext({ data: response });
      },
      (error: any) => subscriber.onError(packError(error)),
      () => subscriber.onComplete()
    );
  });
};
