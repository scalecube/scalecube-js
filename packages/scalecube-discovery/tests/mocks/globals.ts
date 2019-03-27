import { ClustersMap } from '../../src/helpers/types';
import { getGlobalNamespace } from '../../src/helpers/utils'

const globalNamespace = getGlobalNamespace();
globalNamespace.scalecube = globalNamespace.scalecube || { clusters: {} as ClustersMap };
