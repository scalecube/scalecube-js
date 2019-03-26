import { ClustersMap } from '../../src/helpers/types';
import { getGlobal } from '../../src/helpers/utils'

const globalNamespace = getGlobal();

globalNamespace.scalecube = globalNamespace.scalecube || { clusters: {} as ClustersMap };
