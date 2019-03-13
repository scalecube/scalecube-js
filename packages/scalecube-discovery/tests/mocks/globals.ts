import { ClustersMap } from '../../src/api/public'

declare global {
  interface Window {
    scalecube?: {
      discovery?: ClustersMap
    };
  }
}

window.scalecube = window.scalecube || {};
window.scalecube.discovery = window.scalecube.discovery || {};
