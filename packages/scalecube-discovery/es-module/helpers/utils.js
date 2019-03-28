export var getGlobalNamespace = function() {
  return typeof window === 'undefined' ? global : window;
};
export var getScalecubeGlobal = function() {
  return getGlobalNamespace().scalecube || { clusters: {} };
};
