import { lookUp } from '../MicroService/ServiceRegistry';
import { getServiceNamespaceFromMessage } from '../helpers/serviceData';
import { RouteRequest } from '../api/Routers';

export const defaultRouter = Object.freeze({
  route: ({ request, serviceRegistry }: RouteRequest) => {
    const services = lookUp({ serviceRegistry, namespace: getServiceNamespaceFromMessage(request) });
    return services[Object.keys(services)[0]];
  },
});
