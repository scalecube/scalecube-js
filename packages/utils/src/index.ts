import * as check from './check';
import { getFullAddress, validateAddress, getAddress } from './address';
import * as constants from './constants';
import { addWorker, removeWorker, initialize, addIframe } from './connectWorkers';
import { saveToLogs } from './logs';
import { isNodejs } from './checkEnvironemnt';
import { validateServiceDefinition } from './serviceDefinition';
import { getQualifier } from './qualifier';
import { applyPostMessagePolyfill } from './mocks/PostMessageWithTransferPolyfill';
import { applyMessageChannelPolyfill } from './mocks/MessageChannelPolyfill';

const workers = !isNodejs() ? { addWorker, removeWorker, initialize, addIframe } : {};

const mockMessageChannel = () => {
  applyPostMessagePolyfill();
  applyMessageChannelPolyfill();
};

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
  mockMessageChannel,
};
