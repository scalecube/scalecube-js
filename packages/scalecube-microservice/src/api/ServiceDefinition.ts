import { AsyncModel, PrimitiveTypesNoSymbol } from '.';

/**
 * Service metadata
 */
export default interface ServiceDefinition {
  /**
   * The name of a service
   */
  serviceName: PrimitiveTypesNoSymbol;
  /**
   * The map of methods, that exist in the service, with the corresponding asyncModel of each of them
   */
  methods: {
    [methodName: string]: {
      asyncModel: AsyncModel;
    };
  };
}
