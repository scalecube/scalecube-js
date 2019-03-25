import { createDiscoveriesWithSameSeedAddress, expectWithFailNow, } from '../helpers/utils'
import { getDiscoverySuccessfullyDestroyedMessage } from '../../src/helpers/const'

describe('Discovery tests', () => {
  beforeEach(() => {
    window.scalecube.clusters = {};
  });

  test(`Each discovery includes all the itemsToPublish from other discoveries that share the same cluster except its own itemsToPublish)`, (done) => {
    expect.assertions(6);
    let counter = 0;
    const { discovery1, discovery2, discovery3, endPoint1, endPoint2, endPoint3 } = createDiscoveriesWithSameSeedAddress();

    discovery1.discoveredItems$().subscribe(items => {
      items.forEach(item => {
        expectWithFailNow(() => expect([endPoint2, endPoint3]).toContainEqual(item), done);
        counter++;
      });
    });

    discovery2.discoveredItems$().subscribe(items => {
      items.forEach(item => {
        expectWithFailNow(() => expect([endPoint1, endPoint3]).toContainEqual(item), done);
        counter++;
      });
    });

    discovery3.discoveredItems$().subscribe(items => {
      items.forEach(item => {
        expectWithFailNow(() => expect([endPoint1, endPoint2]).toContainEqual(item), done);
        counter++;
        if (counter === 6) {
          done();
        }
      });
    });
  });

  test(`Discoveries that has different seed can't share items between them`, (done) => {
    expect.assertions(2);
    let counter = 0;
    const { discovery1, endPoint2 } = createDiscoveriesWithSameSeedAddress(1);
    const { discovery1: discovery1B, endPoint2: endPoint2B } = createDiscoveriesWithSameSeedAddress(2);
    discovery1.discoveredItems$().subscribe(items => {
      expectWithFailNow(() => expect(items).toContainEqual(endPoint2), done);
      expectWithFailNow(() => expect(items).not.toContainEqual(endPoint2B), done);
      counter++;
      done();
    });
  });


  it('Discovery.destroy will remove itself from the cluster', (done) => {
    expect.assertions(4);

    let destroyFlag = false;
    const { discovery1, discovery2, endPoint1, endPoint3 } = createDiscoveriesWithSameSeedAddress();
    discovery2.discoveredItems$().subscribe(items => {

      if (!destroyFlag) {
        expectWithFailNow(() => expect(items).toContainEqual(endPoint3), done);
        expectWithFailNow(() => expect(items).toContainEqual(endPoint1), done);
        done();
      } else {
        expectWithFailNow(() => expect(items).toContainEqual(endPoint3), done);
        expectWithFailNow(() => expect(items).not.toContainEqual(endPoint1), done);
      }
    });

    destroyFlag = true;
    discovery1.destroy();

  });

  it('Discovery.destroy is resolved with the correct message', async () => {
    expect.assertions(1);

    const { discovery1 } = createDiscoveriesWithSameSeedAddress();
    return expect(discovery1.destroy()).resolves
      .toBe(getDiscoverySuccessfullyDestroyedMessage('address11', 'cluster1'));
  });
});
