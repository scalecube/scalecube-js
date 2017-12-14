// @flow



export const getServiceInterface = (o: Object) => {
  // we`ll have to think about this one... right new just a name
  return o.constructor.name;
};
export const getServiceName = (o: Object) => {
  return o.constructor.name;
};
