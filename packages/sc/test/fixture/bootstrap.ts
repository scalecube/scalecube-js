import { createMicroservice } from '@scalecube/node';
import { GreetingServiceDefinition } from './GreetingServiceDefinition';
import { GreetingService } from './GreetingService';
import { Agent } from '../../src/sandbox/agent';

export function bootstrap(options: { seed: string; address: string; agent: number }) {
  createMicroservice({
    services: [
      {
        definition: GreetingServiceDefinition,
        reference: new GreetingService(),
      },
    ],
    // seedAddress: options.seed,
    address: options.seed,
  });
  Agent.build({
    port: options.agent,
    seed: options.seed,
    address: options.address,
  });
}
