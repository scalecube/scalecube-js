// @flow



export const getServiceInterface = (o) => {
  // we`ll have to think about this one... right new just a name
  return o.constructor.name;
}
export const getServiceName = (o) => {
  return o.constructor.name;
}
