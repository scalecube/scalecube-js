import { AsyncModel } from './public';

export default interface ServiceDefinition {
  serviceName: string;
  methods: {
    [methodName: string]: {
      asyncModel: AsyncModel;
    };
  };
}
