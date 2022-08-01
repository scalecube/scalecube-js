import {
  AsyncModel,
  Message,
  Microservice,
  RequestStreamAsyncModel,
  ServiceCall,
  ServiceDefinition,
} from '@scalecube/api/lib/microservice';
import { from, Observable } from 'rxjs';
import { createMicroservice } from '@scalecube/node';
import Gateway from '@scalecube/rsocket-ws-gateway';
import { tap } from 'rxjs/operators';

interface Options {
  seed: string;
  address: string;
  port: number;
}
interface Invoke {
  asyncModel: AsyncModel;
  message: Message;
}
export interface AgentAPI {
  invoke(req: Invoke): Observable<any>;
}
export const agentDefinition: ServiceDefinition = {
  serviceName: 'sandboxAgent',
  methods: {
    invoke: {
      asyncModel: 'requestStream',
    },
  },
};

export class Agent implements AgentAPI {
  public static build(options: Options) {
    options = {
      ...{ port: 9001 },
      ...options,
    };
    return new Agent(options);
  }
  private ms: Microservice;
  private sc: ServiceCall;
  constructor(options: Options) {
    console.log(options);
    this.ms = createMicroservice({
      services: [
        {
          definition: {
            serviceName: 'sandboxAgent',
            methods: {
              invoke: {
                asyncModel: 'requestStream',
              },
            },
          },
          reference: this,
        },
      ],
      address: options.address,
      seedAddress: options.seed,
    });
    this.sc = this.ms.createServiceCall({});
    const gateway = new Gateway({ port: options.port });
    gateway.start({ serviceCall: this.sc });
  }
  public invoke(req: Invoke): Observable<any> {
    return from(
      req.asyncModel === 'requestStream' ? this.sc.requestStream(req.message) : this.sc.requestResponse(req.message)
    );
  }
}
