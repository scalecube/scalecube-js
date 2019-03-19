import { AsyncModel } from '.';

export default interface ServiceDefinition {
  serviceName: string;
  methods: {
    [methodName: string]: {
      asyncModel: AsyncModel;
    };
  };
}
