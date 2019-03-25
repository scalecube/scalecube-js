export const isNodeEnv = () => typeof window === 'undefined';

export const getGlobal = () => isNodeEnv() ? global : window;
