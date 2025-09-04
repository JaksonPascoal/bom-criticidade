
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

/* ---------- CSV loader com PapaParse + fallback ---------- */
const DATA_PATHS = [
  "./data/processed/criticidade.csv",
  "./data/processed/sample_criticidade.csv",
  "../data/processed/criticidade.csv",
];

function loadCsvPaths(paths) {
  return new Promise(async (resolve, reject) => {
    let lastErr;
    for (const p of paths) {
      const url = p + (p.includes("?") ? `&t=${Date.now()}` : `?t=${Date.now()}`);
      try {
        Papa.parse(url, {
          header: true,
          download: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          // Papa detecta delimitador automaticamente
          complete: (res) => {
            if (res.data && res.data.length) {
              console.log(`CSV OK: ${url} | linhas: ${res.data.length}`);
              resolve(res.data);
            } else {
              throw new Error("CSV vazio");
            }
          },
          error: (e) => { throw e; },
        });
        return; // sai do for ao iniciar parse do primeiro URL válido
      } catch (e) {
        lastErr = e;
        console.warn(`Falha em ${url}:`, e?.message || e);
      }
    }
    reject(lastErr || new Error("Falha ao carregar CSV"));
  });
}

const toNum = (x) => {
  if (x === null || x === undefined || x === "") return 0;
  const n = typeof x === "number" ? x : parseFloat(String(x).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

/* ---------- mapeamento flexível (PT/EN) ---------- */
function mapRow(r) {
  // ids/campos textuais
  const materialId =
    r.material_id ?? r.Material ?? r.material ?? r.codigo ?? r.cod ?? r.id ?? "";
  const descricao = r.descricao ?? r.description ?? "";

  // criticidade de engenharia
  const crit_eng = toNum(r.eng_crit ?? r.criticidade_engenharia ?? r.criticality);

  // lead time em dias
  const lead = toNum(r.lead_time_days ?? r.lead_time_dias ?? r.lead_time ?? r.lt_days);

  // custo unitário
  const custo = toNum(r.unit_cost ?? r.custo_unitario ?? r.preco_unit ?? r.unit_price);

  // estoque atual
  const estoque = toNum(r.stock_qty ?? r.estoque_atual ?? r.estoque ?? r.saldo);

  // consumo diário / mensal (converte se necessário)
  const daily = toNum(r.daily_consumption ?? r.consumo_diario);
  const monthly = toNum(r.consumo_mensal);
  const consumo = monthly || (daily ? daily * 30 : 0);

  // cobertura (meses): usa campo PT se existir; senão calcula de dias
  const coverageDays = toNum(r.coverage_days);
  const coberturaMeses = toNum(r.estoque_cobertura_meses) || (daily ? estoque / (daily * 30) : (coverageDays ? coverageDays / 30 : 0));

  // score
  const score = toNum(r.score ?? r.score_criticidade);

  return {
    id: materialId || descricao || "Material",
    desc: descricao || materialId,
    crit_eng,
    lead,
    custo,
    consumo,
    estoque,
    cobertura: coberturaMeses,
    score,
  };
}

/* ===================== MAIN ===================== */
(async () => {
  try {
    // Carrega CSV (docs → local)
    const data = await loadCsvPaths(DATA_PATHS);
    if (!data.length) throw new Error("CSV sem linhas.");

    // Normaliza linhas
    const rows = data.map(mapRow);

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
