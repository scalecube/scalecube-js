import { createDiscovery } from '../../src';
import { getAddress } from '@scalecube/utils';
import { getDiscoverySuccessfullyDestroyedMessage } from '../../src/helpers/constants';
import { applyPostMessagePolyfill } from '../../../scalecube-microservice/tests/mocks/utils/PostMessageWithTransferPolyfill';
import { applyMessageChannelPolyfill } from '../../../scalecube-microservice/tests/mocks/utils/MessageChannelPolyfill';

describe(`Test discovery destroy`, () => {
  // @ts-ignore
  if (!global.isNodeEvn) {
    applyPostMessagePolyfill();
    applyMessageChannelPolyfill();
  }
  test(`
    Scenario: Call to destroy method destroys the Discovery
    Given     discovery A
    And       discoveredItems$ subscription is opened
    When      calling destroy
    Then      discovery A is destroyed
    And       promise is resolved with message that includes the Discovery address 
    And       discoveredItems$ stream completes
    `, () => {
    expect.assertions(1);

    const aAddress = getAddress('A');

    const discovery = createDiscovery({
      address: aAddress,
      itemsToPublish: [],
    });

    return expect(discovery.destroy()).resolves.toBe(getDiscoverySuccessfullyDestroyedMessage(aAddress));
  });
});
