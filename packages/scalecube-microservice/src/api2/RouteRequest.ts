import Qualifier from './Qualifier';

interface ServiceRegistery {}

export default interface RouteRequest {
  serviceRegistry: ServiceRegistery;
  qualifier: Qualifier;
}
