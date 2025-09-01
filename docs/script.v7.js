
/******************************************************************
 *  Dashboard BOM Criticidade — build V7
 *  - Banner e título para confirmar carga
 *  - CSV com fallback + cache bust
 *  - Nomes pelos campos de negócio (descricao)
 *  - Tooltips ricos e formatação pt-BR
 *  - Gráficos: Top 20, Hist Score, Lead×Custo (bolhas),
 *              Pareto do Score, Criticidade de Eng., Consumo×Estoque
 ******************************************************************/
console.log("docs/script.v7.js ATIVADO");
document.title = "BOM Criticidade";
document.body.insertAdjacentHTML(
  "afterbegin",
  '<div id="bannerV" style="position:fixed;z-index:9999;top:6px;right:8px;background:#16a34a;color:#fff;padding:4px 8px;border-radius:6px;font:600 12px/1.2 system-ui,Segoe UI,Roboto">BUILD V7</div>'
);

/* ---------- util & tema ---------- */
const fmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const fmtMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});
const root = getComputedStyle(document.documentElement);
const tickColor = (root.getPropertyValue("--fg") || "#eaeaea").trim();
const gridColor = (root.getPropertyValue("--grid") || "rgba(255,255,255,0.09)").trim();
const axisFmt = (v) => fmt.format(v);

/* ---------- CSV loader com fallback e no-store ---------- */
async function loadCSVWithFallback(paths) {
  let lastErr;
  for (let p of paths) {
    const url = p + (p.includes("?") ? `&t=${Date.now()}` : `?t=${Date.now()}`);
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).map((l) => {
        const cols = l.split(",").map((c) => c.trim());
        const obj = {};
        headers.forEach((h, i) => (obj[h] = cols[i]));
        return obj;
      });
      console.log(`CSV OK: ${url} | linhas: ${rows.length}`);
      return rows;
    } catch (e) {
      lastErr = e;
      console.warn(`Falha em ${url}:`, e.message);
    }
  }
  throw lastErr || new Error("Falha ao carregar CSV");
}

const toNum = (x) => {
  const n = parseFloat(String(x).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

/* ===================== MAIN ===================== */
(async () => {
  try {
    // Pages primeiro (/docs), depois ambiente local (/dashboard)
    const data = await loadCSVWithFallback([
      "data/processed/criticidade.csv",
      "../data/processed/criticidade.csv",
    ]);
    if (!data.length) throw new Error("CSV sem linhas.");

    // Mapeia para o modelo interno (usa descricao como rótulo principal)
    const rows = data.map((r) => ({
      id: r.descricao || r.material_id || "Material",
      desc: r.material_id || r.descricao || "",
      crit_eng: toNum(r.criticidade_engenharia),
      lead: toNum(r.lead_time_dias),
      custo: toNum(r.custo_unitario),
      consumo: toNum(r.consumo_mensal),
      estoque: toNum(r.estoque_atual),
      cobertura: toNum(r.estoque_cobertura_meses),
      score: toNum(r.score_criticidade),
    }));

    /* ---------- 1) TOP 20 por Score ---------- */
    const top = [...rows].sort((a, b) => b.score - a.score).slice(0, 20);
    const totalScore = rows.reduce((s, r) => s + r.score, 0) || 1;

    const labelsTop = top.map((r) => r.id);
    const scoresTop = top.map((r) => r.score);

    new Chart(document.getElementById("critChart").getContext("2d"), {
      type: "bar",
      data: {
        labels: labelsTop,
        datasets: [
          {
            label: "Score de Criticidade",
            data: scoresTop,
            backgroundColor: "rgba(77,171,247,0.85)",
            borderColor: "rgba(77,171,247,1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              title: (it) => it[0].label,
              label: (it) => `Score: ${fmt.format(it.raw)}`,
              afterBody: (it) => {
                const i = it[0].dataIndex;
                const r = top[i];
                const contrib = (r.score / totalScore) * 100;
                return [
                  `Lead time: ${fmt.format(r.lead)} dias`,
                  `Custo unit.: ${fmtMoney.format(r.custo)}`,
                  `Consumo: ${fmt.format(r.consumo)} un/mês`,
                  `Cobertura: ${fmt.format(r.cobertura)} meses`,
                  `Contribuição no risco: ${fmt.format(contrib)}%`,
                  r.desc ? `ID: ${r.desc}` : "",
                ].filter(Boolean);
              },
            },
          },
          legend: { display: false },
          title: {
            display: true,
            text: "Top 20 Materiais por Criticidade",
          },
        },
        scales: {
          x: {
            ticks: { color: tickColor, autoSkip: false, maxRotation: 60 },
            grid: { color: gridColor },
          },
          y: {
            beginAtZero: true,
            ticks: { color: tickColor, callback: axisFmt },
            grid: { color: gridColor },
          },
        },
      },
    });

    /* ---------- 2) HISTOGRAMA do Score ---------- */
    const scores = rows.map((r) => r.score).filter(Number.isFinite);
    const bins = makeBins(scores, 12);
    makeBar(
      "histScore",
      bins.labels,
      bins.counts,
      "Distribuição dos Scores de Criticidade"
    );

    /* ---------- 3) Dispersão Lead × Custo (raio = Score) ---------- */
    const maxScore = Math.max(...scores, 1e-6);
    const bub = rows.map((r) => ({
      x: r.lead,
      y: r.custo,
      r: 4 + 14 * (r.score / maxScore),
      label: r.id,
      desc: r.desc,
    }));
    makeBubble(
      "bubbleLeadCusto",
      bub,
      "Relação entre Lead Time × Custo (raio = criticidade)"
    );

    /* ---------- 4) Pareto do Score ---------- */
    const pareto = [...rows].sort((a, b) => b.score - a.score);
    const total = pareto.reduce((s, r) => s + r.score, 0) || 1;
    let run = 0;
    const pLabels = pareto.map((_, i) => (i + 1).toString());
    const pBars = pareto.map((r) => r.score);
    const pCum = pareto.map((r) => (run += r.score) / total * 100);
    makePareto(
      "pareto",
      pLabels,
      pBars,
      pCum,
      "Curva de Pareto — Itens mais Críticos (cumulativo %)"
    );

    /* ---------- 5) Barras Criticidade de Engenharia ---------- */
    const counts = countBy(rows.map((r) => r.crit_eng));
    const ceLabels = Object.keys(counts).sort(
      (a, b) => Number(a) - Number(b)
    );
    const ceCounts = ceLabels.map((k) => counts[k]);
    makeBar(
      "barCritEng",
      ceLabels,
      ceCounts,
      "Níveis de Criticidade de Engenharia (contagem)"
    );

    /* ---------- 6) Novo: Consumo × Estoque ---------- */
    const estoqueConsumo = rows.map((r) => ({
      x: r.consumo,
      y: r.estoque,
      label: r.id,
      desc: r.desc,
    }));
    makeScatter(
      "scatterEstoqueConsumo",
      estoqueConsumo,
      "Consumo Mensal × Estoque Atual"
    );
  } catch (e) {
    console.error(e);
  }
})();

/* ===================== HELPERS ===================== */
function makeBar(canvasId, labels, values, title) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: title,
          data: values,
          backgroundColor: "rgba(77,171,247,0.85)",
          borderColor: "rgba(77,171,247,1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: title },
        tooltip: {
          callbacks: { label: (it) => `${fmt.format(it.raw)}` },
        },
      },
      scales: {
        x: { ticks: { color: tickColor, autoSkip: false }, grid: { color: gridColor } },
        y: { beginAtZero: true, ticks: { color: tickColor, callback: axisFmt }, grid: { color: gridColor } },
      },
    },
  });
}

function makeBubble(canvasId, points, title) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "bubble",
    data: {
      datasets: [
        {
          label: title,
          data: points,
          backgroundColor: "rgba(255, 159, 64, 0.8)",
          borderColor: "rgba(255, 159, 64, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: title },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const p = ctx.raw;
              return [
                `${p.label}`,
                `Lead: ${fmt.format(p.x)} dias`,
                `Custo: ${fmtMoney.format(p.y)}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Lead time (dias)" },
          ticks: { color: tickColor, callback: axisFmt },
          grid: { color: gridColor },
        },
        y: {
          title: { display: true, text: "Custo unitário" },
          beginAtZero: true,
          ticks: { color: tickColor, callback: axisFmt },
          grid: { color: gridColor },
        },
      },
    },
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
          borderColor: "rgba(77,171,247,1)",
        },
        {
          type: "line",
          label: "Cumulativo (%)",
          data: cumPerc,
          yAxisID: "y1",
          tension: 0.25,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245,158,11,.25)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, title: { display: true, text: title } },
      scales: {
        y: { beginAtZero: true, ticks: { color: tickColor, callback: axisFmt }, grid: { color: gridColor } },
        y1: {
          beginAtZero: true,
          max: 100,
          position: "right",
          ticks: { color: tickColor, callback: (v) => `${fmt.format(v)}%` },
          grid: { drawOnChartArea: false },
        },
        x: { ticks: { color: tickColor, maxTicksLimit: 20 }, grid: { color: gridColor } },
      },
    },
  });
}

function makeScatter(canvasId, points, title) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: title,
          data: points,
          backgroundColor: "rgba(54, 162, 235, 0.8)",
          borderColor: "rgba(54, 162, 235, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: title },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const p = ctx.raw;
              return [
                `${p.label}`,
                `Consumo: ${fmt.format(p.x)} un/mês`,
                `Estoque: ${fmt.format(p.y)} un`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Consumo mensal (un)" },
          ticks: { color: tickColor, callback: axisFmt },
          grid: { color: gridColor },
        },
        y: {
          title: { display: true, text: "Estoque atual (un)" },
          beginAtZero: true,
          ticks: { color: tickColor, callback: axisFmt },
          grid: { color: gridColor },
        },
      },
    },
  });
}

/* ---------- helpers de dados ---------- */
function makeBins(values, k = 10) {
  if (!values.length) return { labels: [], counts: [] };
  const min = Math.min(...values),
    max = Math.max(...values);
  const step = (max - min) / k || 1;
  const edges = Array.from({ length: k + 1 }, (_, i) => min + i * step);
  const counts = new Array(k).fill(0);
  values.forEach((v) => {
    let idx = Math.floor((v - min) / step);
    if (idx >= k) idx = k - 1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  });
  const labels = counts.map(
    (_, i) => `${edges[i].toFixed(2)}–${edges[i + 1].toFixed(2)}`
  );
  return { labels, counts };
}

function countBy(arr) {
  return arr.reduce((acc, x) => {
    const k = String(x);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}
