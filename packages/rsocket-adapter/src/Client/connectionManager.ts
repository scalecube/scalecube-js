// @ts-ignore
import { ReactiveSocket } from 'rsocket-types';
import { CreateConnectionManager } from '../helpers/types';

export const createConnectionManager: CreateConnectionManager = () => {
  const openConnections: { [key: string]: Promise<ReactiveSocket> } = {};

  return {
    getConnection: (connectionAddress: string) => openConnections[connectionAddress],
    getAllConnections: () => ({ ...openConnections }),
    setConnection: (connectionAddress: string, value: Promise<ReactiveSocket>) =>
      (openConnections[connectionAddress] = value),
    removeConnection: (connectionAddress: string) => delete openConnections[connectionAddress],
  };
};
