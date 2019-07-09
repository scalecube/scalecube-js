import * as Api from '@scalecube/api';
import { createMicroservice } from './Microservices/Microservices';
import { ASYNC_MODEL_TYPES } from './helpers/constants';

export { createMicroservice, ASYNC_MODEL_TYPES, Api };

export default createMicroservice;
