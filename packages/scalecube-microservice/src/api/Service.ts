import { Observable } from 'rxjs6';
import { Message } from './Message';

export interface ServicesFromRawServiceRequest {
  rawService: RawServiceMeta;
}

export interface UpdateServiceRegistryRequest {
  rawService: RawServiceMeta;
  serviceRegistry: object;
}

export interface LookUpRequest {
  namespace: string;
  serviceRegistry: object;
}

interface RawServiceMeta {
  serviceName: string;
  identifier?: string;
  methods: {
    [key: string]: Methods;
  };
}

interface Methods {
  [key: string]: MethodMeta;
}

interface MethodMeta {
  asyncModel: string;
}

export interface ServiceEndPointResponse {
  [key: string]: {
    id: string;
    host: string;
    port: number;
    contentTypes: string[];
    tags: object;
    serviceRegistrations: object;
    service: object;
  };
}

export interface AsyncServiceLoader {
  loader: () => Promise<any>;
  serviceClass: any;
}

export interface MicroServiceConfig {
  services?: any[];
  lazyServices?: LazyService[];
  getPreRequest$?: (req$: Observable<Message>) => any;
  postResponse$?: (req$: Observable<Message>) => any;
}

interface LazyService {
  loader: any;
  meta: any;
}

export interface MicroServiceResponse {
  asProxy: any;
  asDispatcher: any;
}
