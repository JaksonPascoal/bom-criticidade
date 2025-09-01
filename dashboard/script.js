async function loadCSV(path) {
  const res = await fetch(path);
  const text = await res.text();
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  const rows = lines.slice(1).map(l => {
    const cols = l.split(",");
    const obj = {};
    headers.forEach((h, i) => obj[h] = cols[i]);
    return obj;
  });
  return rows;
}

(async () => {
  const data = await loadCSV("../data/processed/criticidade.csv");
  // Top 20 por score
  const sorted = data.sort((a,b) => parseFloat(b.score_criticidade) - parseFloat(a.score_criticidade)).slice(0,20);

  const labels = sorted.map(r => r.material_id);
  const scores = sorted.map(r => parseFloat(r.score_criticidade));
  const lead   = sorted.map(r => Number(r.lead_time_dias));
  const custo  = sorted.map(r => Number(r.custo_unitario));

  const ctx = document.getElementById("critChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Score de Criticidade",
        data: scores
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            afterBody: (items) => {
              const i = items[0].dataIndex;
              return `lead_time: ${lead[i]} d | custo: ${custo[i]}`;
            }
          }
        },
        legend: { display: false }
      },
      scales: {
        x: { ticks: { autoSkip: false, maxRotation: 60, minRotation: 0 } },
        y: { beginAtZero: true }
      }
    }
  });
})();
