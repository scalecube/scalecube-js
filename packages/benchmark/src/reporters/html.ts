import fs from 'fs';
import { Buckets } from '../index';
export function html(data: any[], name: string) {
  const report = {
    name,
    series: data.map((s) => ({
      data: s.data,
      name: `${s.name}, total: ${s.total}, mean: ${s.mean}, stdev: ${s.stdev}`,
    })),
  };
  const f = tmpl(JSON.stringify(report));
  fs.writeFileSync(name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.html', f, { encoding: 'utf8' });
}

const tmpl = (data: string) => `
<div id="anychart-embed-samples-wd-data-from-json-04" class="anychart-embed anychart-embed-samples-wd-data-from-json-04">
<script src="https://cdn.anychart.com/releases/8.11.0/js/anychart-base.min.js?hcode=a0c21fc77e1449cc86299c5faa067dc4"></script>
<script src="https://cdn.anychart.com/releases/8.11.0/js/anychart-exports.min.js?hcode=a0c21fc77e1449cc86299c5faa067dc4"></script>
<script src="https://cdn.anychart.com/releases/8.11.0/js/anychart-ui.min.js?hcode=a0c21fc77e1449cc86299c5faa067dc4"></script>
<div id="ac_style_samples-wd-data-from-json-04" style="display:none;">
html, body, #container {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}
</div>
<script>(function(){
function ac_add_to_head(el){
\tvar head = document.getElementsByTagName('head')[0];
\thead.insertBefore(el,head.firstChild);
}
function ac_add_link(url){
\tvar el = document.createElement('link');
\tel.rel='stylesheet';el.type='text/css';el.media='all';el.href=url;
\tac_add_to_head(el);
}
function ac_add_style(css){
\tvar ac_style = document.createElement('style');
\tif (ac_style.styleSheet) ac_style.styleSheet.cssText = css;
\telse ac_style.appendChild(document.createTextNode(css));
\tac_add_to_head(ac_style);
}
ac_add_link('https://cdn.anychart.com/releases/8.11.0/css/anychart-ui.min.css?hcode=a0c21fc77e1449cc86299c5faa067dc4');
ac_add_style(document.getElementById("ac_style_samples-wd-data-from-json-04").innerHTML);
ac_add_style(".anychart-embed-samples-wd-data-from-json-04{width:100%;height:90%;}");
})();</script>
<div id="container"></div>
<script>
anychart.onDocumentReady(function () {
const data = ${data};
  // JSON data
  var json = {
    // chart settings
    "chart": {
      // chart type
      "type": "column",
      // set chart title
      "title": \`\${data.name}\`,
      // series settings
      "series": data.series,
      // chart container
      "container": "container"
    }
  };

  // get JSON data
  var chart = anychart.fromJson(json);
  chart.legend(true)
  // draw chart
  chart.draw();
});
</script>
</div>
`;
