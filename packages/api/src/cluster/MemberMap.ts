/**
 * member connection state
 */
export interface MembersMap {
  membersState: MembersData;
  membersPort: MembersPort;
}

/**
 * information of the other members.
 * <member, metadata of the member>
 */
export interface MembersData {
  [member: string]: any;
}

/**
 * information of the connected ports
 * <member, MessagePort>
 */
export interface MembersPort {
  [member: string]: MessagePort;
}
