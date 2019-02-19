import AsyncModel from './AsyncModel';

export default interface RawServiceDefinition {
  serviceName: string;
  methods: {
    [methodName: string]: {
      asyncModel: AsyncModel;
    };
  };
}
