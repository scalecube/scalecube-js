export interface ConnectWorkerEvent {
  detail: {
    whoAmI: string;
  };
  type: ConnectWorkerEventType;
}

export type ConnectWorkerEventType = 'ConnectWorkerEvent';
