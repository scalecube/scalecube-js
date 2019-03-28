import { Microservices as MicroservicesInterface } from '../api';
export declare const Microservices: MicroservicesInterface;
export declare const createMicroserviceContext: () => {
  serviceRegistry: import('../helpers/types').ServiceRegistry;
  methodRegistry: import('../helpers/types').MethodRegistry;
};
