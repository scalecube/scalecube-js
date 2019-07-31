export interface SwimEvent {
  host: string;
  meta: any;
  state: SwimEventAlive | SwimEventSuspect | SwimEventFaulty;
  incarnation: number;
}

export type SwimEventAlive = 0;
export type SwimEventSuspect = 1;
export type SwimEventFaulty = 2;
