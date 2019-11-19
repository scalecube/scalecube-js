export const getSerializers = () => ({
  data: {
    deserialize: (data: any) => data,
    serialize: (data: any) => data,
  },
  metadata: {
    deserialize: (data: any) => data,
    serialize: (data: any) => data,
  },
});

export const getSetup = (setup: { [key: string]: any }) => ({
  dataMimeType: (setup && setup.dataMimeType) || 'text/plain',
  keepAlive: (setup && setup.keepAlive) || 1000000,
  lifetime: (setup && setup.lifetime) || 1000000,
  metadataMimeType: (setup && setup.metadataMimeType) || 'text/plain',
});
