import { Single } from 'rsocket-flowable';

export const requestResponse = (payload, serviceCall) => {
  const { data, metadata } = payload;
  // console.log('Request:', data, metadata);
  return new Single((subscriber) => {
    subscriber.onSubscribe();
    serviceCall({
      message: JSON.parse(data),
      asyncModel: 'requestResponse',
      // includeMessage: true,
    })
      .then((resp: any) => {
        // console.log('RESP', resp);
        subscriber.onComplete({ data: JSON.stringify(resp) });
      })
      .catch((err: any) => {
        subscriber.onError(err);
      });
  });
};
