import { ClusterApi, Address } from '@scalecube/api';
import { MEMBERSHIP_EVENT } from '../helpers/constants';
import { getFullAddress } from '@scalecube/utils';
import { setLocalAddress } from '../helpers/utils';

export const createMember = (address: Address, membersStatus: ClusterApi.MembersMap) => {
  const whoAmI = getFullAddress(address);
  setLocalAddress(whoAmI);

  /**
   * membership event format
   * @param from
   * @param to
   * @param metadata
   * @param origin
   * @param type
   */
  const getMembershipEvent = ({ from, to, metadata, origin, type }: ClusterApi.MembershipEvent) => ({
    detail: {
      metadata,
      type,
      from,
      origin,
      to,
    },
    type: MEMBERSHIP_EVENT,
  });

  /**
   * loop on all connected members and update them on the change
   * @param type
   * @param metadata
   * @param from
   * @param to
   * @param origin
   */
  const updateConnectedMember = ({
    type,
    metadata,
    from,
    to,
    origin,
  }: {
    from: string;
    to: string;
    origin: string;
    metadata: any;
    type: ClusterApi.MemberEventType;
  }) => {
    const { membersPort } = membersStatus;

    Object.keys(membersPort).forEach((nextMember: string) => {
      if (from !== nextMember && whoAmI !== nextMember && origin !== nextMember) {
        const mPort: MessagePort = membersPort[nextMember];
        mPort.postMessage(
          getMembershipEvent({
            from: whoAmI,
            to: nextMember,
            origin: from,
            metadata,
            type,
          })
        );
      }
    });
  };

  return {
    getMembershipEvent,
    updateConnectedMember,
    whoAmI,
  };
};
