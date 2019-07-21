// @ts-ignore
import { RSocketClientSocket } from 'rsocket-core';
import { CreateConnectionManager } from '../helpers/types';

export const createConnectionManager: CreateConnectionManager = () => {
  const openConnections: { [key: string]: Promise<RSocketClientSocket> } = {};

  return {
    getConnection: (connectionAddress: string) => openConnections[connectionAddress],
    getAllConnections: () => ({ ...openConnections }),
    setConnection: (connectionAddress: string, value: Promise<RSocketClientSocket>) =>
      (openConnections[connectionAddress] = value),
    removeConnection: (connectionAddress: string) => delete openConnections[connectionAddress],
  };
};
