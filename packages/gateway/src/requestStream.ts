import { Flowable } from 'rsocket-flowable';

export const requestStream = (payload, serviceCall) => {
  console.log('request payload: ', payload);
  const { data, metadata } = payload;
  return new Flowable((subscriber: any) => {
    subscriber.onSubscribe();
    const message = JSON.parse(data);
    serviceCall({
      message,
      asyncModel: 'requestStream',
    }).subscribe(
      (response: any) => {
        subscriber.onNext({ data: JSON.stringify(response) });
      },
      (error: any) => subscriber.onError(error),
      () => subscriber.onComplete()
    );
  });
};
