import { JoinCluster, Cluster, GetCluster, LeaveCluster } from '../helpers/types';
export declare const getCluster: ({ seedAddress }: GetCluster) => Cluster;
export declare const leaveCluster: ({ cluster, address }: LeaveCluster) => Cluster;
export declare const joinCluster: ({ cluster, itemsToPublish, address, subjectNotifier }: JoinCluster) => Cluster;
