import { lookUp } from '../Microservices/ServiceRegistry';
import { ABTestingRequest, RouteRequest } from '../api/Routers';

export const AB = Object.freeze({
  '10:90': ({ a, b }: ABTestingRequest) => {
    return {
      route: ({ request, serviceRegistry }: RouteRequest) =>
        randomRoute({ a, b, trashHold: 10, request, serviceRegistry }),
    };
  },
  '20:80': ({ a, b }: ABTestingRequest) => {
    return {
      route: ({ request, serviceRegistry }: RouteRequest) =>
        randomRoute({ a, b, trashHold: 20, request, serviceRegistry }),
    };
  },
  '60:70': ({ a, b }: ABTestingRequest) => {
    return {
      route: ({ request, serviceRegistry }: RouteRequest) =>
        randomRoute({ a, b, trashHold: 30, request, serviceRegistry }),
    };
  },
  '40:60': ({ a, b }: ABTestingRequest) => {
    return {
      route: ({ request, serviceRegistry }: RouteRequest) =>
        randomRoute({ a, b, trashHold: 40, request, serviceRegistry }),
    };
  },
  '50:50': ({ a, b }: ABTestingRequest) => {
    return {
      route: ({ request, serviceRegistry }: RouteRequest) =>
        randomRoute({ a, b, trashHold: 50, request, serviceRegistry }),
    };
  },
});

const randomRoute = ({ a, b, trashHold, request, serviceRegistry }) => {
  const random = Math.random() * 100;
  const endpoints = lookUp({ serviceRegistry, qualifier: request.qualifier });
  return endpoints[random <= trashHold ? a : b];
};
