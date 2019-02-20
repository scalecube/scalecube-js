export default interface Endpoint {
  uri: string;
  qualifier: string;
  transport: string;
  serviceName: string;
  methodName: string;
  methodPointer: {
    [mathodName: string]: (data: any) => any;
  };
  context: object;
}
