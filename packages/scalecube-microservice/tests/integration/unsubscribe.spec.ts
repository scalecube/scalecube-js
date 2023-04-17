import { ASYNC_MODEL_TYPES } from '../../lib';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

describe('test', () => {
  test('debug', (done) => {
    const definition = {
      serviceName: 'serviceA',
      methods: {
        methodA: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM },
      },
    };
    const reference = {
      methodA: () =>
        new Subject().asObservable().pipe(
          finalize(() => {
            console.log('done');
            done();
          })
        ),
    };
    const services = [{ definition, reference }];
  });
});
