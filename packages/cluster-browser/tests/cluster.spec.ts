import { clusterSpec } from '../../api/src/cluster/tests/cluster.spec';
import { joinCluster } from '../src';

describe('behavior', () => {
  clusterSpec(joinCluster);
});

// import {joinCluster} from "../src";
// import {getAddress} from "@scalecube/utils";
//
// describe("test", () => {
//     it("test", (done) => {
//         const loga: any = [];
//         const logb: any = [];
//         const logc: any = [];
//         const start = Date.now();
//         const a = joinCluster({
//             address: getAddress("a"),
//             itemsToPublish: ["a"],
//         });
//         const b = joinCluster({
//             address: getAddress("b"),
//             seedAddress: [getAddress("a")],
//             itemsToPublish: ["b"],
//         });
//         const c = joinCluster({
//             address: getAddress("c"),
//             seedAddress: [getAddress("b")],
//             itemsToPublish: ["c"],
//         });
//         a.listen$().subscribe((i)=>{
//             loga.push({...i, ts:Date.now()-start});
//         });
//         b.listen$().subscribe((i)=>{
//             logb.push({...i, ts:Date.now()-start});
//         });
//         c.listen$().subscribe((i)=>{
//             logc.push({...i, ts:Date.now()-start});
//         });
//
//         setTimeout(()=>{
//             // console.log("##############################");
//             // a.getCurrentMembersData().then((d)=>console.log(">>>>>>>>>>>>>", d))
//             // b.getCurrentMembersData().then((d)=>console.log(">>>>>>>>>>>>>", d))
//             // c.getCurrentMembersData().then((d)=>console.log(">>>>>>>>>>>>>", d))
//             c.destroy();
//             b.destroy();
//             a.destroy();
//         }, 500)
//
//         setTimeout(()=>{
//             console.log(loga);
//             console.log(logb);
//             console.log(logc);
//             done();
//         }, 1000);
//
//     });
// });
