// @flow
export type Type = 'add' | 'remove' | 'change';

export interface MembershipEvent {
  type: Type;
  sender: string;
  id: string;
  metadata: any;
}
