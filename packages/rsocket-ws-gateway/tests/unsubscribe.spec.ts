import { ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { Gateway } from '../src/Gateway';
import { createGatewayProxy } from '@scalecube/rsocket-ws-gateway-client';
import { createMicroservice } from '@scalecube/browser';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

test(`Scenario: client unsubscribe should trigger server unsubscribe 
    Given microservices with gateway 
    And   a service
    When  a client wants to access the service
    And   the client sends a request to the gateway
    Then  gateway doesn't receive the request`, (done) => {
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

  const ms = createMicroservice({ services });
  const p = ms.createProxy({
    serviceDefinition: definition,
  });
  //p.methodA().subscribe().unsubscribe();
  const serviceCall = ms.createServiceCall({});
  const gateway = new Gateway({ port: 8051 });
  gateway.start({ serviceCall });
  createGatewayProxy('ws://localhost:8051', definition).then((p) => {
    console.log('gateway');
    const sub = p.methodA().subscribe();
    console.log(sub.unsubscribe());
  });
});
