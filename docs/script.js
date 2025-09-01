async function loadCSV(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Falha ao carregar ${path}: ${res.status}`);
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const headers = lines[0].split(",").map(h => h.trim());
  const rows = lines.slice(1).map(l => {
    const cols = l.split(",").map(c => c.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cols[i]));
    return obj;
  });
  return rows;
}
const toNum = x => {
  const n = parseFloat(String(x).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

// estilos padrão para tema dark
const gridColor = "rgba(255,255,255,0.09)";
const tickColor = "#eaeaea";

(async () => {
  try {
    const data = await loadCSV("data/processed/criticidade.csv");
    if (!data.length) throw new Error("CSV sem linhas.");

    const rows = data.map(r => ({
      id: r.material_id || r.descricao || "item",
      desc: r.descricao,
      crit_eng: toNum(r.criticidade_engenharia),
      lead: toNum(r.lead_time_dias),
      custo: toNum(r.custo_unitario),
      consumo: toNum(r.consumo_mensal),
      estoque: toNum(r.estoque_atual),
      cobertura: toNum(r.estoque_cobertura_meses),
      score: toNum(r.score_criticidade)
    }));

    // ---------- 1) TOP 20 ----------
   // ... após construir 'rows'
const top = [...rows].sort((a,b)=>b.score-a.score).slice(0,20);
const totalScore = rows.reduce((s,r)=>s + r.score, 0) || 1;

const labelsTop = top.map(r => r.id);
const scoresTop = top.map(r => r.score);
const descTop   = top.map(r => r.desc);

const ctxTop = document.getElementById("critChart").getContext("2d");
new Chart(ctxTop, {
  type: "bar",
  data: {
    labels: labelsTop,
    datasets: [{
      label: "Score de Criticidade",
      data: scoresTop,
      backgroundColor: "rgba(77,171,247,0.85)",
      borderColor: "rgba(77,171,247,1)",
      borderWidth: 1
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          beforeBody: (items) => {
            const i = items[0].dataIndex;
            return descTop[i]; // descrição do material
          },
          afterBody: (items) => {
            const i = items[0].dataIndex;
            const contrib = (scoresTop[i] / totalScore * 100).toFixed(2);
            return `Contribuição no risco: ${contrib}%`;
          }
        }
      },
      legend: { display: false }
    },
    scales: {
      x: { ticks: { color: "#eaeaea", autoSkip: false, maxRotation: 60 }, grid: { color: "rgba(255,255,255,0.09)" } },
      y: { beginAtZero: true, ticks: { color: "#eaeaea" }, grid: { color: "rgba(255,255,255,0.09)" } }
    }
  }
});


    // ---------- 2) HISTOGRAMA do score ----------
    const scores = rows.map(r=>r.score).filter(n=>Number.isFinite(n));
    const bins = makeBins(scores, 12);
    makeBar(
      "histScore",
      bins.labels,
      bins.counts,
      "Distribuição do Score"
    );

    // ---------- 3) Dispersão lead x custo (bolha = score) ----------
    const maxScore = Math.max(...scores, 1e-6);
    const bub = rows.map(r => ({
  x: r.lead,
  y: r.custo,
  r: 4 + 14*(r.score/maxScore),
  label: `${r.id} — ${r.desc}`
}));
    makeBubble("bubbleLeadCusto", bub, "Lead time × Custo (raio = score)");

    // ---------- 4) Pareto (cumulativo do risco) ----------
    const pareto = [...rows].sort((a,b)=>b.score-a.score);
    const total = pareto.reduce((s,r)=>s+r.score,0) || 1;
    let run = 0;
    const pLabels = pareto.map((r,i)=> (i+1).toString());
    const pBars   = pareto.map(r=>r.score);
    const pCum    = pareto.map(r => (run += r.score) / total * 100);
    makePareto("pareto", pLabels, pBars, pCum, "Pareto do Score (cumulativo %)");

    // ---------- 5) Barras Criticidade de Engenharia ----------
    const counts = countBy(rows.map(r=>r.crit_eng));
    const ceLabels = Object.keys(counts).sort((a,b)=>Number(a)-Number(b));
    const ceCounts = ceLabels.map(k=>counts[k]);
    makeBar("barCritEng", ceLabels, ceCounts, "Criticidade de Engenharia (contagem)");

  } catch (e) {
    console.error(e);
  }
})();

// ----- helpers de gráfico -----
function makeBar(canvasId, labels, values, title) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: title, data: values, backgroundColor: "rgba(77,171,247,0.85)", borderColor: "rgba(77,171,247,1)", borderWidth: 1 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: tickColor, autoSkip: false }, grid: { color: gridColor } },
        y: { beginAtZero: true, ticks: { color: tickColor }, grid: { color: gridColor } }
      }
    }
  });
}

function makeBubble(canvasId, points, title) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "bubble",
    data: {
      datasets: [{
        label: title,
        data: points,
        backgroundColor: "rgba(255, 159, 64, 0.8)",
        borderColor: "rgba(255, 159, 64, 1)"
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: "Lead time (dias)" }, ticks: { color: tickColor }, grid: { color: gridColor } },
        y: { title: { display: true, text: "Custo unitário" }, ticks: { color: tickColor }, grid: { color: gridColor } }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const p = ctx.raw;
              return `${p.label}: lead ${p.x} d, custo ${p.y}`;
            }
          }
        },
        legend: { display: false }
      }
    }
  });
}

function makePareto(canvasId, labels, bars, cumPerc, title) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    data: {
      labels,
      datasets: [
        {
          type: "bar",
          label: "Score",
          data: bars,
          yAxisID: "y",
          backgroundColor: "rgba(77,171,247,0.85)",
          borderColor: "rgba(77,171,247,1)"
        },
        {
          type: "line",
          label: "Cumulativo (%)",
          data: cumPerc,
          yAxisID: "y1",
          tension: 0.25
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        y:  { beginAtZero: true, ticks: { color: tickColor }, grid: { color: gridColor } },
        y1: { beginAtZero: true, max: 100, position: "right", ticks: { color: tickColor }, grid: { drawOnChartArea: false } },
        x:  { ticks: { color: tickColor, maxTicksLimit: 20 }, grid: { color: gridColor } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function makeBins(values, k=10) {
  if (!values.length) return { labels: [], counts: [] };
  const min = Math.min(...values), max = Math.max(...values);
  const step = (max - min) / k || 1;
  const edges = Array.from({length: k+1}, (_,i)=> min + i*step);
  const counts = new Array(k).fill(0);
  values.forEach(v => {
    let idx = Math.floor((v - min) / step);
    if (idx >= k) idx = k-1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  });
  const labels = counts.map((_,i)=> `${(edges[i]).toFixed(2)}–${(edges[i+1]).toFixed(2)}`);
  return { labels, counts };
}

function countBy(arr) {
  return arr.reduce((acc, x) => {
    const k = String(x);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}
