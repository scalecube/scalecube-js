import { ServiceDefinition } from '@scalecube/api/lib/microservice';

export const GreetingServiceDefinition: ServiceDefinition = {
  serviceName: 'GreetingService',
  methods: {
    greet: {
      asyncModel: 'requestResponse',
    },
  },
};
