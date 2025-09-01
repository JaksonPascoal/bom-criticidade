import os
import random
import csv

os.makedirs("data/raw", exist_ok=True)
path = "data/raw/bom.csv"

headers = [
    "material_id","descricao","criticidade_engenharia",
    "lead_time_dias","custo_unitario","consumo_mensal","estoque_atual"
]

random.seed(42)
rows = []
for i in range(1, 301):
    rows.append([
        f"M{i:04d}",
        f"Material {i}",
        random.randint(1,5),
        max(1, int(random.gauss(30, 10))),          # lead time
        round(max(5, random.gauss(150, 60)), 2),    # custo
        max(1, int(random.gauss(40, 20))),          # consumo
        max(0, int(random.gauss(80, 40)))           # estoque
    ])

with open(path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(rows)

print(f"[OK] Gerado: {path} ({len(rows)} linhas)")
