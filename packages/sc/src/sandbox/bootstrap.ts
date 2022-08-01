import { createMicroservice } from '@scalecube/node';
import { Sandbox, SandboxDefinition } from './sandbox';
import { Registry, RegistryDefinition } from './registry';
import Gateway from '@scalecube/rsocket-ws-gateway';

export function bootstrap(options: { address: string; gateway: number }) {
  const mc = createMicroservice({
    services: [
      {
        definition: SandboxDefinition,
        reference: (opts) => new Sandbox(opts),
      },
      {
        definition: RegistryDefinition,
        reference: new Registry(),
      },
    ],
    address: options.address,
    debug: true,
  });
  const gateway = new Gateway({ port: options.gateway });
  gateway.start({ serviceCall: mc.createServiceCall({}) });
}
