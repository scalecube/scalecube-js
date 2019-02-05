export type ServiceMeta = Methods & {
  serviceName: string;
};

export interface RawServiceMeta {
  serviceName: string;
  methods: {
    [key: string]: Methods;
  };
}

interface Methods {
  [key: string]: MethodMeta;
}

interface MethodMeta {
  type: string; // asyncModel
}

export interface ServiceEndPoint {
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
  services: [];
  loadServicesAsync: AsyncServiceLoader[];
  preRequest$: any;
  postResponse$: any;
}

export interface MicroServiceResponse {
  asProxy: any;
  asDispatcher: any;
}
