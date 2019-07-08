import { applyPostMessagePolyfill } from './mocks/PostMessageWithTransferPolyfill';
import { applyMessageChannelPolyfill } from './mocks/MessageChannelPolyfill';

applyPostMessagePolyfill();
applyMessageChannelPolyfill();
