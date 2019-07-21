export interface MembersMap {
  membersState: MembersData;
  membersPort: MembersPort;
}

export interface MembersData {
  [member: string]: any;
}

export interface MembersPort {
  [member: string]: MessagePort;
}
