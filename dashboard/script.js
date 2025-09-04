// dashboard/script.js

// Caminho do CSV processado (use 'sample_criticidade.csv' se preferir)
const DATA_PATH = "../data/processed/criticidade.csv"; // ou ../data/processed/sample_criticidade.csv

// Utils ---------------------------------------------------------
const toNum = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));
const fmt = (n, d = 0) => (isNaN(n) ? "-" : Number(n).toFixed(d));
const colorByEng = (eng) => {
  // escala simples: 0 -> claro, 10 -> vermelho forte
  const t = Math.max(0, Math.min(1, eng / 10));
  const r = 200 + Math.round(55 * t);
  const g = 80 - Math.round(60 * t);
  const b = 80 - Math.round(60 * t);
  return `rgba(${r},${Math.max(g,0)},${Math.max(b,0)},0.8)`;
};

function parseCsv(path) {
  return new Promise((resolve, reject) => {
    Papa.parse(path, {
      header: true,
      download: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (res) => resolve(res.data),
      error: reject,
    });
  });
}

// Charts --------------------------------------------------------
let scatterChart, paretoChart;

function buildScatter(data) {
  const pts = data.map((d) => ({
    x: toNum(d.coverage_days),
    y: toNum(d.lead_time_days),
    r: 4,
    backgroundColor: colorByEng(toNum(d.eng_crit)),
    borderColor: "rgba(0,0,0,0.1)",
    label: d.material_id,
  }));

  const xMin = 0;
  const xMax = Math.max(30, ...data.map((d) => toNum(d.coverage_days))) || 30;
  const linePts = [
    { x: xMin, y: xMin },
    { x: xMax, y: xMax },
  ];

  const ctx = document.getElementById("scatterRisk").getContext("2d");
  if (scatterChart) scatterChart.destroy();
  scatterChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Itens",
          data: pts,
          parsing: false,
          pointBackgroundColor: pts.map((p) => p.backgroundColor),
          pointRadius: pts.map((p) => p.r),
          showLine: false,
        },
        {
          label: "y = x (limite)",
          type: "line",
          data: linePts,
          borderColor: "rgba(80,80,80,0.7)",
          borderWidth: 1.5,
          pointRadius: 0,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const p = ctx.raw;
              const row = data[ctx.dataIndex];
              return [
                `Material: ${row.material_id}`,
                `Cov(d): ${fmt(p.x, 1)} | LT(d): ${fmt(p.y, 1)}`,
                `Eng: ${fmt(row.eng_crit, 1)}  Score: ${fmt(row.score, 2)}`,
              ];
            },
          },
        },
      },
      scales: {
        x: { title: { display: true, text: "Cobertura (dias)" }, beginAtZero: true },
        y: { title: { display: true, text: "Lead time (dias)" }, beginAtZero: true },
      },
    },
  });
}

function buildPareto(data) {
  const sorted = [...data].sort((a, b) => b.annual_value - a.annual_value);
  const topN = sorted.slice(0, 20); // mostra os 20 maiores
  const labels = topN.map((d) => d.material_id);
  const values = topN.map((d) => d.annual_value);
  const total = values.reduce((s, v) => s + v, 0) || 1;
  let acc = 0;
  const cum = values.map((v) => ((acc += v) / total) * 100);

  const ctx = document.getElementById("paretoABC").getContext("2d");
  if (paretoChart) paretoChart.destroy();
  paretoChart = new Chart(ctx, {
    data: {
      labels,
      datasets: [
        {
          type: "bar",
          label: "Valor anual",
          data: values,
          yAxisID: "y",
        },
        {
          type: "line",
          label: "Acumulado (%)",
          data: cum,
          yAxisID: "y1",
          borderWidth: 2,
          pointRadius: 2,
        },
      ],
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        y: { title: { display: true, text: "Valor anual" } },
        y1: {
          position: "right",
          min: 0,
          max: 100,
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Acumulado (%)" },
        },
        x: { ticks: { autoSkip: false, maxRotation: 60, minRotation: 0 } },
      },
    },
  });
}

function buildRiskTable(data) {
  const tbody = document.querySelector("#riskTable tbody");
  tbody.innerHTML = "";
  const rows = [...data]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 20);

  const actionFor = (r) => {
    if (r.risk_flag && r.suggest_qty > 0) return "Reabastecer agora";
    if (!r.risk_flag && r.coverage_days > r.lead_time_days * 2) return "Reduzir estoque";
    if (r.lead_time_days >= 60) return "Rever lead time";
    return "Monitorar";
    };

  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.material_id}</td>
      <td>${fmt(r.eng_crit, 1)}</td>
      <td>${fmt(r.lead_time_days, 0)}</td>
      <td>${fmt(r.coverage_days, 0)}</td>
      <td>${fmt(r.score, 2)}</td>
      <td>${fmt(r.risk_score, 2)}</td>
      <td>${fmt(r.suggest_qty, 0)}</td>
      <td>${actionFor(r)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Boot ----------------------------------------------------------
(async function () {
  const rows = await parseCsv(DATA_PATH);

  // tipagem garantida
  const data = rows.map((r) => ({
    material_id: r.material_id ?? r.Material ?? r.id,
    category: r.category ?? "N/A",
    supplier: r.supplier ?? "N/A",
    eng_crit: toNum(r.eng_crit),
    lead_time_days: toNum(r.lead_time_days),
    unit_cost: toNum(r.unit_cost),
    stock_qty: toNum(r.stock_qty),
    daily_consumption: toNum(r.daily_consumption),
    coverage_days: toNum(r.coverage_days),
    annual_value: toNum(r.annual_value),
    score: toNum(r.score),
    risk_flag: Number(r.risk_flag) || 0,
    risk_score: toNum(r.risk_score),
    abc_class: r.abc_class ?? "",
    xyz_class: r.xyz_class ?? "",
    suggest_qty: toNum(r.suggest_qty),
  }));

  buildScatter(data);
  buildPareto(data);
  buildRiskTable(data);
})();
