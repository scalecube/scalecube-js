import * as check from './check';
import { getFullAddress, validateAddress, getAddress } from './address';
import * as constants from './constants';
import { addWorker, removeWorker } from './connectWorkers';
import { saveToLogs } from './logs';
import { isNodejs } from './checkEnvironemnt';
import { validateServiceDefinition } from './serviceDefinition';
import { getQualifier } from './qualifier';

const workers = !isNodejs() ? { addWorker, removeWorker } : {};

export {
  check,
  getFullAddress,
  validateAddress,
  constants,
  getAddress,
  workers,
  saveToLogs,
  isNodejs,
  validateServiceDefinition,
  getQualifier,
};
