export const isNodejs = () => typeof process === 'object' && checkNodeVersion() && !checkIfTest();

const checkNodeVersion = () => typeof process.versions === 'object' && typeof process.versions.node !== 'undefined';

const checkIfTest = () => process.env && process.env.NODE_ENV === 'test';
