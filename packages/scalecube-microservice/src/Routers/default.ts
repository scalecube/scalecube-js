import { lookUp } from '../Microservices/ServiceRegistry';
import { getServiceNamespaceFromMessage } from '../helpers/serviceData';
import RouteOptions from '../api2/public/RouteOptions';

export const defaultRouter = Object.freeze({
  route: ({ qualifier, serviceRegistry }: RouteOptions) => {
    const services = lookUp({ serviceRegistry, namespace: getServiceNamespaceFromMessage(qualifier) });
    if (!services) {
      throw Error(`can't find services with the request: '${JSON.stringify(qualifier)}'`);
    } else {
      return services[Object.keys(services)[0]];
    }
  },
});
