// @flow
export type Type = 'add' | 'remove' | 'change';

export interface MembershipEvent {
  type: Type;
  sender: string;
  address: string;
  metadata: any;
}
