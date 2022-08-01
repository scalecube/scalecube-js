import { createGatewayProxy } from '@scalecube/rsocket-ws-gateway-client';
import { from, fromEvent, scan, switchMap, tap } from 'rxjs';

const sbdef = {
  serviceName: 'Sandbox',
  methods: {
    services$: { asyncModel: 'requestStream' },
    log$: { asyncModel: 'requestStream' },
    env$: { asyncModel: 'requestStream' },
    invoke: { asyncModel: 'requestStream' },
  },
};
const regdef = {
  serviceName: 'registry',
  methods: {
    register: {
      asyncModel: 'requestResponse',
    },
    list$: {
      asyncModel: 'requestStream',
    },
  },
};
const gw = createGatewayProxy('ws://127.0.0.1:8999/', [sbdef, regdef]);

gw.then(([sb, reg]) => {
  (window as any).reg = reg;
  (window as any).sb = sb;
  // sb.invoke({
  //     agent: 'ws://127.0.0.1:9099/',
  //     message: {
  //         qualifier: 'GreetingService/greet',
  //         data: ['Bob']
  //     },
  //     asyncModel: 'requestResponse'
  // })
  //     .pipe(tap(console.log))
  //     .subscribe()
});

const sb$ = from(gw).pipe(switchMap(([sb]) => from([sb])));

const services$ = sb$.pipe(
  switchMap((sb) => sb.services$({})),
  tap(console.log),
  scan((services: any, svc: any) => {
    services[svc.name] = Object.keys(svc.methods);
    return services;
  }, {})
);

class SbCatalog extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `<input id="method" list="methods" /><datalist id="methods"></dadatalist>`;
  }

  public connectedCallback() {
    services$
      .pipe(
        tap((services: any) => {
          // console.log(services)
          // let html = "<ul>\n";
          // Object.keys(services).forEach((service) => {
          //     html += `<li>${service}</li>`;
          //     html += "<ul>\n";
          //     services[service].forEach((method)=>{
          //         html += `<li>${method}</li>`
          //     });
          //     html += "</ul>";
          // });
          // html += "</ul>";
          let html = ``;
          Object.keys(services).forEach((service) => {
            services[service].forEach((method) => {
              html += `<option value="${service}/${method}">`;
            });
          });
        })
      )
      .subscribe();
  }
}
window.customElements.define('sb-catalog', SbCatalog);

class SbForm extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = `
<form>
    <textarea id="json"></textarea>
    <input type="button" value="invoke">
</form>
        `;
  }

  public connectedCallback() {
    const value = (sl, value = undefined) => {
      const e = this.querySelector(sl) as Element & { value: string };
      const ret = e.value || '';

      if (value !== undefined) {
        e.value = value;
      }
      return ret;
    };
    const click$ = fromEvent(this.querySelector('input'), 'click');
    click$
      .pipe(
        switchMap(() =>
          sb$.pipe(
            tap(() => console.log('click')),
            switchMap((sb) =>
              sb
                .invoke({
                  agent: 'ws://127.0.0.1:8998/',
                  message: {
                    qualifier: 'GreetingService/greet', //document.querySelector("#method").value || '',
                    data: [], // JSON.parse(value("#json"))
                  },
                })
                .pipe(tap(console.log))
            )
          )
        )
      )
      .subscribe();
  }
}

window.customElements.define('sb-form', SbForm);
