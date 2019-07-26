import { applyPostMessagePolyfill } from './mocks/utils/PostMessageWithTransferPolyfill';
import { applyMessageChannelPolyfill } from './mocks/utils/MessageChannelPolyfill';

applyPostMessagePolyfill();
applyMessageChannelPolyfill();
