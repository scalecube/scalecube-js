import AsyncModel from './AsyncModel';
import { PrimitiveTypesNoSymbol } from './index';

/**
 * Defines local service data
 */
export default interface Reference {
  /**
   * The combination of serviceName and methodName: <serviceName/methodName>
   */
  qualifier: string;
  /**
   * The name of a service, that is provided in serviceDefinition
   */
  serviceName: PrimitiveTypesNoSymbol;
  /**
   * The name of a method, that is provided in the methods map in serviceDefinition
   */
  methodName: string;
  /**
   * The map of the name of a method from a service and its implementation
   */
  reference?: {
    [methodName: string]: (...args: any[]) => any;
  };
  /**
   * Type of communication between a consumer and a provider
   */
  asyncModel: AsyncModel;
}
