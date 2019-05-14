import { AsyncModel, PrimitiveTypes } from '.';

/**
 * Service metadata
 */
export default interface ServiceDefinition {
  /**
   * The name of a service
   */
  serviceName: PrimitiveTypes;
  /**
   * The map of methods, that exist in the service, with the corresponding asyncModel of each of them
   */
  methods: {
    [methodName: string]: {
      asyncModel: AsyncModel;
    };
  };
}
