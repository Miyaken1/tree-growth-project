
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.js';

const API_URL = 'https://script.google.com/macros/s/AKfycbwmeveXSc0ihOnOgQhtX5Mtaj1QWiATUlGXEIJwlBAgl_yGe7ULgjpVfYwC8IWiOS4/exec';

const ctx = document.getElementById('barChart');
let barChart;
async function loadData() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  const url = `${API_URL}?action=breakdown&start=${start}&end=${end}`;
  const res = await fetch(url, {cache:'no-store'});
  const {data=[]} = await res.json();
  const labels = data.map(d=>d.label);
  const values = data.map(d=>d.value);

  if (!barChart) {
    barChart = new Chart(ctx, {
      type:'bar',
      data:{labels,
        datasets:[{label:'人数',data:values}]},
      options:{responsive:true,maintainAspectRatio:false}
    });
  } else {
    barChart.data.labels = labels;
    barChart.data.datasets[0].data = values;
    barChart.update();
  }
}
document.getElementById('reloadBtn').addEventListener('click', loadData);
loadData();
