// /**
//  * webWorker example,
//  * using a worker thread to run microservice container
//  *
//  * then requesting from the worker to run a service
//  *
//  */
//
// window.addEventListener('DOMContentLoaded', (event) => {
//   ((createMicroservice, workers, ASYNC_MODEL_TYPES, definitions, canvasUtil) => {
//     const worker = new Worker('worker1.js');
//     const worker2 = new Worker('worker2.js');
//
//     workers.initialize();
//
//     workers.addWorker(worker);
//     workers.addWorker(worker2);
//
//     let firstFlag = false;
//
//     const colorMap = {
//       ms1: 'green',
//       ms2: 'red',
//       ms3: 'pink',
//       ms4: 'purple',
//       ms5: 'blue',
//     };
//
//     let ms1;
//     let ms2;
//     let ms3;
//     let ms4;
//     let ms5;
//
//     let msBtnCounter = 0;
//     let subBtnCounter = 0;
//
//     const layout = canvasUtil.setLayout();
//
//     layout.explanation(`Distributed environment example`, 300, 50, 20);
//
//     const btnsArr = document.getElementsByClassName('ms');
//     for (let btn of btnsArr) {
//       btn.style.color = colorMap[btn.id];
//       const btnEventHandler = (ev) => {
//         btn.removeEventListener('click', btnEventHandler);
//         const el = ev.target;
//
//         msBtnCounter++;
//         if (msBtnCounter === 5) {
//           document.getElementById('msContainerTitle').style.display = 'none';
//         }
//         btn.style.display = 'none';
//
//         if (!firstFlag) {
//           firstFlag = true;
//           const { asyncProxy1, asyncProxy2, asyncProxy3, asyncProxy4, asyncProxy5 } = createMicroservice({
//             seedAddress: el.id,
//           }).createProxies({
//             proxies: [
//               {
//                 serviceDefinition: definitions.remoteServiceDefinition1,
//                 proxyName: 'asyncProxy1',
//               },
//               {
//                 serviceDefinition: definitions.remoteServiceDefinition2,
//                 proxyName: 'asyncProxy2',
//               },
//               {
//                 serviceDefinition: definitions.remoteServiceDefinition3,
//                 proxyName: 'asyncProxy3',
//               },
//               {
//                 serviceDefinition: definitions.remoteServiceDefinition4,
//                 proxyName: 'asyncProxy4',
//               },
//               {
//                 serviceDefinition: definitions.remoteServiceDefinition5,
//                 proxyName: 'asyncProxy5',
//               },
//             ],
//             isAsync: true,
//           });
//
//           layout.explanation(`services will be resolved via ${el.id}`, 200, 300, 14, colorMap[el.id]);
//           layout.explanation(`(first ms instance called)`, 200, 320, 14, colorMap[el.id]);
//           layout.explanation(`services are resolved when appear as `, 200, 360);
//           layout.explanation(`black dots`, 200, 380);
//
//           asyncProxy1.then(() => ms1.stopFlag());
//           asyncProxy2.then(() => ms2.stopFlag());
//           asyncProxy3.then(() => ms3.stopFlag());
//           asyncProxy4.then(() => ms4.stopFlag());
//           asyncProxy5.then(() => ms5.stopFlag());
//
//           const subscriptionIndication = (id, text, el, res) => {
//             el.classList.remove('primaryBtn');
//             el.innerHTML = text;
//             document.getElementById(id).innerHTML = `${res} seconds`;
//           };
//
//           const calls = document.getElementsByClassName('callService');
//           for (let callService of calls) {
//             callService.style.color = colorMap[el.id];
//             const servicesEventHandler = (ev) => {
//               const { target } = ev;
//
//               subBtnCounter++;
//               if (subBtnCounter === 5) {
//                 document.getElementById('subscriptionContainerTitle').style.display = 'none';
//               }
//
//               callService.removeEventListener('click', servicesEventHandler);
//               switch (target.dataset.service) {
//                 case 'ms1':
//                   asyncProxy1.then(({ proxy: service1 }) =>
//                     service1
//                       .getInterval(1000)
//                       .subscribe((res) =>
//                         subscriptionIndication('service1Output', 'service1 subscription:', callService, res)
//                       )
//                   );
//                   break;
//                 case 'ms2':
//                   asyncProxy2.then(({ proxy: service2 }) =>
//                     service2
//                       .getInterval(1000)
//                       .subscribe((res) =>
//                         subscriptionIndication('service2Output', 'service2 subscription:', callService, res)
//                       )
//                   );
//                   break;
//                 case 'ms3':
//                   asyncProxy3.then(({ proxy: service3 }) =>
//                     service3
//                       .getInterval(1000)
//                       .subscribe((res) =>
//                         subscriptionIndication('service3Output', 'service3 subscription:', callService, res)
//                       )
//                   );
//                   break;
//                 case 'ms4':
//                   asyncProxy4.then(({ proxy: service4 }) =>
//                     service4
//                       .getInterval(1000)
//                       .subscribe((res) =>
//                         subscriptionIndication('service4Output', 'service4 subscription:', callService, res)
//                       )
//                   );
//                   break;
//                 case 'ms5':
//                   asyncProxy5.then(({ proxy: service5 }) =>
//                     service5
//                       .getInterval(1000)
//                       .subscribe((res) =>
//                         subscriptionIndication('service5Output', 'service5 subscription:', callService, res)
//                       )
//                   );
//                   break;
//               }
//             };
//
//             callService.addEventListener('click', servicesEventHandler);
//           }
//         }
//
//         if (el.dataset.location === 'worker1') {
//           worker.postMessage({
//             detail: el.id,
//             type: 'start',
//           });
//         } else {
//           worker2.postMessage({
//             detail: el.id,
//             type: 'start',
//           });
//         }
//
//         switch (el.id) {
//           case 'ms1':
//             ms1 = layout.addMember('ms1', 500, 300, colorMap['ms1'], [], {
//               x: 570,
//               y: 330,
//               title: 'ms1 located in worker1',
//               subText: '',
//             });
//             break;
//           case 'ms2':
//             ms2 = layout.addMember(
//               'ms2',
//               500,
//               100,
//               colorMap['ms2'],
//               [
//                 {
//                   endX: 500,
//                   endY: 300,
//                   color: 'red',
//                   dependency: 'ms1',
//                 },
//               ],
//               {
//                 x: 580,
//                 y: 120,
//                 title: 'ms2 located in worker2',
//                 subText: 'connecting to ms1 (worker1)',
//               }
//             );
//             break;
//           case 'ms3':
//             ms3 = layout.addMember(
//               'ms3',
//               500,
//               600,
//               colorMap['ms3'],
//               [
//                 {
//                   endX: 500,
//                   endY: 300,
//                   color: 'pink',
//                   dependency: 'ms1',
//                 },
//               ],
//               {
//                 x: 500,
//                 y: 670,
//                 title: 'ms3 located in worker1',
//                 subText: 'connecting to ms1 (worker1)',
//               }
//             );
//             break;
//           case 'ms4':
//             ms4 = layout.addMember(
//               'ms4',
//               100,
//               100,
//               colorMap['ms4'],
//               [
//                 {
//                   endX: 500,
//                   endY: 100,
//                   color: 'purple',
//                   dependency: 'ms2',
//                 },
//               ],
//               {
//                 x: 100,
//                 y: 50,
//                 title: 'ms4 located in worker1',
//                 subText: 'connecting to ms2 (worker2)',
//               }
//             );
//             break;
//           case 'ms5':
//             ms5 = layout.addMember(
//               'ms5',
//               100,
//               600,
//               colorMap['ms5'],
//               [
//                 {
//                   endX: 100,
//                   endY: 100,
//                   color: 'blue',
//                   dependency: 'ms4',
//                 },
//               ],
//               { x: 100, y: 670, title: 'ms5 located in worker2', subText: 'connecting to ms4 (worker1)' }
//             );
//             break;
//         }
//       };
//
//       btn.addEventListener('click', btnEventHandler);
//     }
//   })(window.sc.createMicroservice, window.sc.workers, window.sc.ASYNC_MODEL_TYPES, definitions, canvasUtil);
// });
