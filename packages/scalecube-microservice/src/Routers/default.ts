import { lookUp } from '../Microservices/ServiceRegistry';
import { getServiceNamespaceFromMessage } from '../helpers/serviceData';
import RouteRequest from '../api2/RouteRequest';

export const defaultRouter = Object.freeze({
  route: ({ qualifier, serviceRegistry }: RouteRequest) => {
    const services = lookUp({ serviceRegistry, namespace: getServiceNamespaceFromMessage(qualifier) });
    if (!services) {
      throw Error(`can't find services with the request: '${JSON.stringify(qualifier)}'`);
    } else {
      return services[Object.keys(services)[0]];
    }
  },
});
