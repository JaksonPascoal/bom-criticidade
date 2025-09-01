import os
import pandas as pd
import numpy as np

RAW = "data/raw/bom.csv"
OUT_DIR = "data/processed"
OUT = f"{OUT_DIR}/criticidade.csv"

os.makedirs(OUT_DIR, exist_ok=True)

# ---- 1) Ler
df = pd.read_csv(RAW)

# ---- 2) Limpeza básica
# nulos -> imputação simples
num_cols = ["criticidade_engenharia","lead_time_dias","custo_unitario","consumo_mensal","estoque_atual"]
for c in num_cols:
    if df[c].isna().any():
        df[c] = df[c].fillna(df[c].median())

# evitar zeros ruins
df["consumo_mensal"] = df["consumo_mensal"].clip(lower=1)

# ---- 3) Features auxiliares
df["estoque_cobertura_meses"] = df["estoque_atual"] / df["consumo_mensal"]

# normalizações robustas (0–1)
def robust_minmax(s: pd.Series):
    q1, q3 = s.quantile(0.25), s.quantile(0.75)
    iqr = max(q3 - q1, 1e-9)
    z = (s - q1) / iqr        # escala robusta
    return (z - z.min()) / (z.max() - z.min() + 1e-9)

df["crit_eng_norm"]   = robust_minmax(df["criticidade_engenharia"])
df["lead_norm"]       = robust_minmax(df["lead_time_dias"])
df["custo_norm"]      = robust_minmax(df["custo_unitario"])
df["cobertura_norm"]  = robust_minmax(df["estoque_cobertura_meses"])

# ---- 4) Score interpretável
# maior criticidade, maior lead, maior custo => MAIS crítico
# maior cobertura de estoque => MENOS crítico
df["score_criticidade"] = (
    0.40 * df["crit_eng_norm"] +
    0.25 * df["lead_norm"] +
    0.20 * df["custo_norm"] +
    0.15 * (1 - df["cobertura_norm"])
)

# ---- 5) Saída ordenada
cols_out = [
    "material_id","descricao",
    "criticidade_engenharia","lead_time_dias","custo_unitario",
    "consumo_mensal","estoque_atual","estoque_cobertura_meses",
    "score_criticidade"
]
df_out = df[cols_out].sort_values("score_criticidade", ascending=False)

df_out.to_csv(OUT, index=False, encoding="utf-8")
print(f"[OK] Processado: {OUT} | linhas: {len(df_out)}")
