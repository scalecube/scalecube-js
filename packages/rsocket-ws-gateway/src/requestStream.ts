import { Flowable } from 'rsocket-flowable';
import { packError } from './utils';

export const requestStream = (payload, serviceCall) => {
  // console.log('request payload: ', payload);
  const { data, metadata } = payload;
  return new Flowable((subscriber: any) => {
    subscriber.onSubscribe();
    const message = JSON.parse(data);
    serviceCall
      .requestStream(
        message
        // asyncModel: 'requestStream',
      )
      .subscribe(
        (response: any) => {
          subscriber.onNext({ data: JSON.stringify(response) });
        },
        (error: any) => subscriber.onError(packError(error)),
        () => subscriber.onComplete()
      );
  });
};
