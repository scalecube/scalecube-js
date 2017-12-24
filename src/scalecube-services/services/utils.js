// @flow



export const getServiceInterface = (o: Object) => {
  // we`ll have to think about this one... right new just a name
  return o.constructor.name;
};
export const getServiceName = (o: Object) => {
  return o.meta.serviceName || o.constructor.meta && o.constructor.meta.serviceName || o.constructor.name;
};
export const isLoader = (inst: Object | null) => {
  return inst.service && inst.service.meta && inst.service.meta.type === 'Loader';
}
/*export const invokePromiseService = (...args:any[]) => {
  this.then(()=>);
}*/
