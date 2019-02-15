import AsyncModel from './AsyncModel';

export default interface ServiceDefinition {
  serviceName: string;
  methods: {
    [methodName: string]: {
      asyncModel: AsyncModel;
    };
  };
}
