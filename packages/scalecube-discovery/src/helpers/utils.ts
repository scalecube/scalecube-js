export const getGlobalNamespace = () => (typeof window === 'undefined' ? global : window);

export const getScalecubeGlobal = () => {
  return getGlobalNamespace().scalecube || { clusters: {} };
};
