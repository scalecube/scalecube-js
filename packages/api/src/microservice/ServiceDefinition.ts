import { AsyncModel } from '.';

/**
 * @interface ServiceDefinition
 * Service metadata
 */
export interface ServiceDefinition {
  /**
   * @property
   * The name of a service
   */
  serviceName: string;
  /**
   * @property
   * The map of methods, that exist in the service, with the corresponding asyncModel of each of them
   */
  methods: {
    [methodName: string]: {
      asyncModel: AsyncModel;
    };
  };
}
