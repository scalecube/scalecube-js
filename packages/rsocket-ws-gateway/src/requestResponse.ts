import { Single } from 'rsocket-flowable';
import { packError } from './utils';

export const requestResponse = (payload, serviceCall, customCb) => {
  const { data, metadata } = payload;
  if (customCb) {
    return new Single(customCb.bind(null, serviceCall, data));
  }
  return new Single((subscriber) => {
    subscriber.onSubscribe();
    serviceCall
      .requestResponse(data)
      .then((resp: any) => {
        // console.log('RESP', resp);
        subscriber.onComplete({ data: resp });
      })
      .catch((err: any) => {
        subscriber.onError(packError(err));
      });
  });
};
