import { from, Observable, Subject, throwError } from 'rxjs';
import { filter, finalize, map, switchMap, tap } from 'rxjs/operators';
import { AsyncModel, Message, Microservice, ServiceDefinition } from '@scalecube/api/lib/microservice';
import { Entry, EnvEntry, RegistryAPI, RegistryDefinition, ServiceEntry } from './registry';
import { AgentAPI, agentDefinition } from './agent';
import { createGatewayProxy } from '@scalecube/rsocket-ws-gateway-client';

interface ServiceMethod {
  asyncModel: AsyncModel;
  metadata: any;
}

export interface Env {
  name: string;
  agent: string;
  metadata: any;
}

export interface Service {
  name: string;
  metadata: any;
  methods: { [name: string]: ServiceMethod };
}

export interface SandboxAPI {
  services$(req: {}): Observable<Service>;

  env$(req: {}): Observable<Env>;

  invoke(req: { agent: string; message: Message; asyncModel: AsyncModel }): Observable<any> | Promise<any>;

  log$(): Observable<string>;
}
export const SandboxDefinition: ServiceDefinition = {
  serviceName: 'Sandbox',
  methods: {
    services$: { asyncModel: 'requestStream' },
    log$: { asyncModel: 'requestStream' },
    env$: { asyncModel: 'requestStream' },
    invoke: { asyncModel: 'requestStream' },
  },
};

export class Sandbox implements SandboxAPI {
  private registry: RegistryAPI;
  private agents: any = {};
  private logSbj$ = new Subject<string>();

  constructor(options: any) {
    console.log('sandbox build');
    this.registry = options.createProxy({
      serviceDefinition: RegistryDefinition,
    });
  }

  public services$(req: {}): Observable<Service> {
    return this.registry.list$({}).pipe(
      filter((i) => i.type === 'Service'),
      map((i: any) => i.service as Service)
    );
  }

  public env$(req: {}): Observable<Env> {
    return this.registry.list$({}).pipe(
      filter((i) => i.type === 'Env'),
      map((i: any) => i.env as Env)
    );
  }

  public invoke(req: { agent: string; message: Message; asyncModel: AsyncModel }): Observable<any> {
    this.logSbj$.next(
      `${req.asyncModel} ${req.message.qualifier} on ${req.agent} with ${JSON.stringify(req.message.data)}`
    );
    try {
      this.agents[req.agent] = this.agents[req.agent] || createGatewayProxy(req.agent, agentDefinition);
    } catch (e) {
      this.logSbj$.next(`${req.message.qualifier} on ${req.agent} got error ${e.message}`);
    }
    return from(this.agents[req.agent]).pipe(
      switchMap((agent: any) =>
        agent.invoke({
          asyncModel: req.asyncModel,
          message: req.message,
        })
      ),
      tap((i: any) => this.logSbj$.next(`${req.message.qualifier} on ${req.agent} respond with ${JSON.stringify(i)}`)),
      finalize(() => this.logSbj$.next(`${req.message.qualifier} on ${req.agent} ended`))
    );
  }

  public log$(): Observable<string> {
    return this.logSbj$.asObservable();
  }
}
