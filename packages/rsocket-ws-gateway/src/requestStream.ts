import { Flowable } from 'rsocket-flowable';
import { packError } from './utils';

export const requestStream = (payload, serviceCall) => {
  // console.log('request payload: ', payload);
  const { data, metadata } = payload;
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
